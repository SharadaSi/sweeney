<?php
// ==========================================================================
// Inquiry Form Handler — server-side validation + secure email dispatch
// ==========================================================================
//
// Receives POST data from the inquiry form (via fetch), validates every
// field server-side, and sends a formatted email to the site owner.
// Returns a JSON response so the frontend can display success / error.
// ==========================================================================

declare(strict_types=1);

// ---- Configuration -------------------------------------------------------

// Recipient email — all inquiries are delivered here
const RECIPIENT_EMAIL = 'simova.sarka@email.cz';

// Allowed origin domains (no trailing slash).
// Add your staging domain while testing.
const ALLOWED_ORIGINS = [
    'https://aloneconcept.cz',
    'https://www.aloneconcept.cz',
    'https://sweeney.onrender.com'
    'https://www.sweeney.onrender.com'
];

// Rate-limit: max submissions per session within the cooldown window (seconds)
const RATE_LIMIT_MAX    = 5;
const RATE_LIMIT_WINDOW = 600; // 10 minutes

// ---- Whitelists for radio / select values --------------------------------

const VALID_INTERESTS = ['rodinny-dum', 'tiny-house', 'projektova-dokumentace'];

const VALID_URGENCIES = ['specha', 'mam-cas', 'budoucnost'];

const VALID_LOCATIONS = [
    'praha', 'stredocesky', 'jihocesky', 'plzensky', 'karlovarsky',
    'ustecky', 'liberecky', 'kralovehradecky', 'pardubicky', 'vysocina',
    'jihomoravsky', 'olomoucky', 'zlinsky', 'moravskoslezsky',
];

// Human-readable labels for the email body
const INTEREST_LABELS = [
    'rodinny-dum'              => 'Rodinný dům',
    'tiny-house'               => 'Tiny house',
    'projektova-dokumentace'   => 'Projektová dokumentace',
];

const URGENCY_LABELS = [
    'specha'     => 'Spěchá to (< 3 měsíce)',
    'mam-cas'    => 'Mám čas (3–12 měsíců)',
    'budoucnost' => 'Hudba budoucnosti (> 12 měsíců)',
];

const LOCATION_LABELS = [
    'praha'              => 'Praha',
    'stredocesky'        => 'Středočeský kraj',
    'jihocesky'          => 'Jihočeský kraj',
    'plzensky'           => 'Plzeňský kraj',
    'karlovarsky'        => 'Karlovarský kraj',
    'ustecky'            => 'Ústecký kraj',
    'liberecky'          => 'Liberecký kraj',
    'kralovehradecky'    => 'Královéhradecký kraj',
    'pardubicky'         => 'Pardubický kraj',
    'vysocina'           => 'Kraj Vysočina',
    'jihomoravsky'       => 'Jihomoravský kraj',
    'olomoucky'          => 'Olomoucký kraj',
    'zlinsky'            => 'Zlínský kraj',
    'moravskoslezsky'    => 'Moravskoslezský kraj',
];


// ==========================================================================
// Helper functions
// ==========================================================================

/**
 * Send a JSON response and terminate.
 */
function jsonResponse(int $statusCode, array $payload): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    // Security headers — prevent MIME sniffing, clickjacking, XSS reflection
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');

    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Format a numeric value as Czech crowns (e.g. 4 500 000 Kč).
 */
function formatCZK(int $value): string
{
    return number_format($value, 0, ',', ' ') . ' Kč';
}


// ==========================================================================
// 1. Accept only POST requests
// ==========================================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['error' => 'Povolena je pouze metoda POST.']);
}


// ==========================================================================
// 2. Origin / Referer verification (CSRF mitigation for static sites)
// ==========================================================================

$origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';

// In production, enforce that the request originates from our own domain.
// During local development (localhost / 127.0.0.1) we allow the request through.
$isLocalDev = (
    str_contains($origin, 'localhost') ||
    str_contains($origin, '127.0.0.1') ||
    str_contains($referer, 'localhost') ||
    str_contains($referer, '127.0.0.1')
);

if (!$isLocalDev) {
    $originAllowed  = in_array($origin, ALLOWED_ORIGINS, true);
    $refererAllowed = false;

    foreach (ALLOWED_ORIGINS as $allowed) {
        if (str_starts_with($referer, $allowed)) {
            $refererAllowed = true;
            break;
        }
    }

    // At least one of Origin or Referer must match
    if (!$originAllowed && !$refererAllowed) {
        jsonResponse(403, ['error' => 'Neautorizovaný požadavek.']);
    }
}


// ==========================================================================
// 3. Honeypot — hidden field that real users never fill in
// ==========================================================================

$honeypot = trim($_POST['website'] ?? '');

if ($honeypot !== '') {
    // Bot detected — return a fake success so the bot thinks it worked
    jsonResponse(200, ['success' => true]);
}


// ==========================================================================
// 4. Rate limiting (session-based)
// ==========================================================================

session_start();

$now = time();

// Initialize or clean up stale timestamps
if (!isset($_SESSION['form_submissions']) || !is_array($_SESSION['form_submissions'])) {
    $_SESSION['form_submissions'] = [];
}

// Remove entries outside the current window
$_SESSION['form_submissions'] = array_filter(
    $_SESSION['form_submissions'],
    static fn(int $ts): bool => ($now - $ts) < RATE_LIMIT_WINDOW
);

if (count($_SESSION['form_submissions']) >= RATE_LIMIT_MAX) {
    jsonResponse(429, ['error' => 'Příliš mnoho odeslaných formulářů. Zkuste to později.']);
}

// Record this submission
$_SESSION['form_submissions'][] = $now;


// ==========================================================================
// 5. Input sanitization + validation
// ==========================================================================

$errors = [];

// ---- Name ----------------------------------------------------------------
$name = trim(strip_tags($_POST['name'] ?? ''));

if ($name === '') {
    $errors[] = 'Vyplňte prosím jméno a příjmení.';
} elseif (mb_strlen($name) < 3) {
    $errors[] = 'Jméno musí mít alespoň 3 znaky.';
} elseif (mb_strlen($name) > 100) {
    $errors[] = 'Jméno nesmí přesáhnout 100 znaků.';
}

// ---- Email ---------------------------------------------------------------
$email = trim(strip_tags($_POST['email'] ?? ''));

if ($email === '') {
    $errors[] = 'Vyplňte prosím e-mail.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Zadejte platnou e-mailovou adresu.';
}

// ---- Interest (radio) ----------------------------------------------------
$interest = trim($_POST['interest'] ?? '');

if (!in_array($interest, VALID_INTERESTS, true)) {
    $errors[] = 'Vyberte prosím oblast zájmu.';
}

// ---- Urgency (radio) -----------------------------------------------------
$urgency = trim($_POST['urgency'] ?? '');

if (!in_array($urgency, VALID_URGENCIES, true)) {
    $errors[] = 'Vyberte prosím termín realizace.';
}

// ---- Location (select) ---------------------------------------------------
$location = trim($_POST['location'] ?? '');

if (!in_array($location, VALID_LOCATIONS, true)) {
    $errors[] = 'Vyberte prosím kraj.';
}

// ---- Budget (numeric range) ----------------------------------------------
$budgetMin = filter_var($_POST['budget_min'] ?? 0, FILTER_VALIDATE_INT);
$budgetMax = filter_var($_POST['budget_max'] ?? 0, FILTER_VALIDATE_INT);

if ($budgetMin === false || $budgetMin < 0) {
    $budgetMin = 0;
}

if ($budgetMax === false || $budgetMax < 0) {
    $budgetMax = 0;
}

// Ensure min does not exceed max
if ($budgetMin > $budgetMax && $budgetMax > 0) {
    $errors[] = 'Minimální rozpočet nesmí být vyšší než maximální.';
}

// ---- Message (optional) --------------------------------------------------
$message = trim(strip_tags($_POST['message'] ?? ''));

if (mb_strlen($message) > 5000) {
    $errors[] = 'Zpráva nesmí přesáhnout 5 000 znaků.';
}

// ---- Return validation errors if any ------------------------------------
if (!empty($errors)) {
    jsonResponse(422, ['errors' => $errors]);
}


// ==========================================================================
// 6. Build and send email
// ==========================================================================

// ---- Compose readable email body -----------------------------------------

$interestLabel = INTEREST_LABELS[$interest] ?? $interest;
$urgencyLabel  = URGENCY_LABELS[$urgency]   ?? $urgency;
$locationLabel = LOCATION_LABELS[$location] ?? $location;

$budgetLine = ($budgetMin > 0 || $budgetMax > 0)
    ? formatCZK($budgetMin) . ' – ' . formatCZK($budgetMax)
    : 'Neuvedeno';

$messageLine = ($message !== '') ? $message : '—';

$body = <<<EMAIL
Nová poptávka z webu Alone Concept
====================================

Jméno:           {$name}
E-mail:          {$email}
Zájem o:         {$interestLabel}
Termín:          {$urgencyLabel}
Lokalita:        {$locationLabel}
Rozpočet:        {$budgetLine}

Zpráva:
{$messageLine}

------------------------------------
Odesláno: {$now} (UNIX timestamp)
IP: {$_SERVER['REMOTE_ADDR']}
EMAIL;

// ---- Email headers -------------------------------------------------------
// User-supplied data ($name, $email) is placed ONLY in the body,
// NOT in any header field — this prevents header-injection attacks.
// Reply-To uses the validated email so the recipient can reply directly.

$subject = 'Nová poptávka — Alone Concept';

// Sanitize the Reply-To address: strip any CR/LF to block header injection
$safeReplyTo = str_replace(["\r", "\n", "%0a", "%0d"], '', $email);

$headers  = "From: noreply@aloneconcept.cz\r\n";
$headers .= "Reply-To: {$safeReplyTo}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: AloneConcept-InquiryForm\r\n";

// ---- Send ----------------------------------------------------------------
$sent = mail(RECIPIENT_EMAIL, $subject, $body, $headers);

if (!$sent) {
    // Log the failure server-side (error_log writes to the PHP error log)
    error_log('Inquiry form: mail() failed for ' . $safeReplyTo);
    jsonResponse(500, ['error' => 'Odeslání se nezdařilo. Zkuste to prosím znovu.']);
}

jsonResponse(200, ['success' => true]);