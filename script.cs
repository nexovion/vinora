document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('domainForm');

form.addEventListener('submit', e => {
  e.preventDefault();

  const name = document
    .getElementById('domainInput')
    .value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');

  const tld = document.getElementById('tldSelect').value;
  const result = document.getElementById('domainResult');

  result.classList.remove('hidden');

  result.innerHTML = name
    ? `<strong>${name}${tld}</strong> looks available in this demo. Live reseller/API verification will be added in production.`
    : 'Enter a domain name to search.';
});

document.getElementById('generateDemo').addEventListener('click', () => {
  document.getElementById('builderMsg').textContent =
    'Demo generated: Home • About • Services • Gallery • Contact';
});
