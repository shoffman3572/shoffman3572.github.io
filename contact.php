<?php
// contact.php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function json_fail(int $code, string $msg): void {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg]);
  exit;
}

function clean_str(string $s): string {
  $s = trim($s);
  // Remove null bytes and normalize newlines
  $s = str_replace("\0", '', $s);
  $s = preg_replace("/\r\n|\r/", "\n", $s);
  return $s;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_fail(405, 'Method not allowed.');
}

// Honeypot: if "company" is filled, it’s almost certainly a bot
$company = isset($_POST['company']) ? clean_str((string)$_POST['company']) : '';
if ($company !== '') {
  // Pretend success to avoid tipping off bots
  echo json_encode(['ok' => true]);
  exit;
}

$name    = isset($_POST['name']) ? clean_str((string)$_POST['name']) : '';
$email   = isset($_POST['email']) ? clean_str((string)$_POST['email']) : '';
$message = isset($_POST['message']) ? clean_str((string)$_POST['message']) : '';

if ($name === '' || $email === '' || $message === '') {
  json_fail(400, 'All fields are required.');
}

if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
  json_fail(400, 'Name must be 2–80 characters.');
}

if (mb_strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_fail(400, 'Please provide a valid email address.');
}

if (mb_strlen($message) < 10 || mb_strlen($message) > 2000) {
  json_fail(400, 'Message must be 10–2000 characters.');
}

// Basic header injection prevention
if (preg_match("/\n|\r/", $email) || preg_match("/\n|\r/", $name)) {
  json_fail(400, 'Invalid input.');
}

// --- Configure these ---
$to = 'shoffman3572@gmail.com';           // where you want to receive messages
$subject = 'Portfolio Contact Form Message';
$fromEmail = 'no-reply@yourdomain.com';   // use a domain mailbox for best deliverability

// Build email safely
$bodyLines = [
  "Name: {$name}",
  "Email: {$email}",
  "",
  "Message:",
  $message,
  "",
  "----",
  "Sent from: " . ($_SERVER['HTTP_HOST'] ?? 'unknown host'),
  "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown ip'),
];

$body = implode("\n", $bodyLines);

// Headers
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=utf-8';
$headers[] = "From: {$fromEmail}";
$headers[] = "Reply-To: {$email}";

// Send
$ok = mail($to, $subject, $body, implode("\r\n", $headers));

if (!$ok) {
  json_fail(500, 'Email could not be sent (server mail not configured).');
}

echo json_encode(['ok' => true]);
