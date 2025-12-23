const axios = require('axios');
const isDisposableEmail = require('is-disposable-email');
const disposableDomains = require('disposable-email-domains');
const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY;

// Expanded custom blocklist with newer and popular disposable email domains
const mailpsSuffixes = [
  'com', 'org', 'net', 'info', 'biz', 'co', 'us', 'xyz', 'site', 'store', 'tech', 'space', 'one', 'today',
  'world', 'live', 'app', 'fun', 'top', 'vip', 'run', 'win', 'cloud', 'page', 'group', 'team', 'zone', 'club',
  'center', 'city', 'company', 'expert', 'global', 'media', 'network', 'systems', 'tools', 'website', 'work',
  'agency', 'consulting', 'digital', 'engineer', 'marketing', 'solutions', 'studio', 'training', 'uno', 'vc',
  'email', 'io', 'link', 'pro'
];
const mailpsDomains = mailpsSuffixes.map(suffix => `mailps.${suffix}`);

const moaktSuffixes = [
  'agency', 'app', 'biz', 'cc', 'center', 'city', 'club', 'co', 'company', 'consulting', 'digital', 'email',
  'engineer', 'expert', 'fun', 'global', 'group', 'info', 'io', 'link', 'live', 'marketing', 'me', 'media',
  'mobi', 'network', 'one', 'page', 'pro', 'run', 'site', 'solutions', 'space', 'studio', 'store', 'systems',
  'team', 'tech', 'today', 'tools', 'top', 'training', 'uno', 'us', 'vc', 'vip', 'win', 'work', 'world', 'ws', 'xyz'
];
const moaktDomains = moaktSuffixes.map(suffix => `moakt.${suffix}`);

const customBlocklist = [
  '1secmail.com', '1secmail.net', '1secmail.org', '10minutemail.net', 'anonbox.net', 'disposablemail.com',
  'dropmail.me', 'ethsms.com', 'fakeinbox.com', 'forexnews.bg', 'getnada.com', 'guerrillamail.com',
  'ibolinva.com', 'inboxkitten.com', 'linshiyouxiang.net', 'mail-temp.com', 'mail.tm', 'mail7.io',
  'mailcatch.com', 'maildim.com', 'maildrop.cc', 'mailinator.com', 'mailnesia.com', 'mailpoof.com',
  ...mailpsDomains, ...moaktDomains,
  'my10minutemail.com', 'sharklasers.com', 'spamgourmet.com', 'tempmail.lol', 'temp-mail.org', 'tempail.com',
  'temporary-mail.net', 'trashmail.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net'
];

function isEmailDisposable(email) {
  if (!email || typeof email !== 'string') return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  if (isDisposableEmail(email) || (domain && disposableDomains.includes(domain)) || (domain && customBlocklist.includes(domain))) {
    return true;
  }
    return false;  
}

module.exports = {isEmailDisposable}; 