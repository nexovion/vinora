document.addEventListener("DOMContentLoaded", () => {

  // VIONORA Domain Search
  const searchBtn = document.querySelector("#domainSearchBtn");
  const domainInput = document.querySelector("#domainName");
  const extension = document.querySelector("#domainExtension");
  const result = document.querySelector("#domainResult");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const name = domainInput?.value.trim();
      const ext = extension?.value || ".com";

      if (!name) {
        alert("Please enter a domain name.");
        return;
      }

      const domain = name.replace(/\s+/g, "").toLowerCase() + ext;

      if (result) {
        result.innerHTML = `
          <div class="domain-result">
            <strong>${domain}</strong>
            <p>Domain availability checking will be connected soon.</p>
          </div>
        `;
      } else {
        alert(`Searching for ${domain}`);
      }
    });
  }

  // Hosting Plan Buttons
  document.querySelectorAll(".choose-plan").forEach(button => {
    button.addEventListener("click", () => {
      const plan = button.dataset.plan || "Hosting";
      alert(`${plan} plan selected. Checkout will be added soon.`);
    });
  });

  // AI Website Builder Demo
  const generateBtn = document.querySelector("#generateSite");

  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      alert(
        "VIONORA AI Website Builder demo started. Full AI generation will be connected later."
      );
    });
  }

  // Business Email
  const emailBtn = document.querySelector("#addEmail");

  if (emailBtn) {
    emailBtn.addEventListener("click", () => {
      alert("Business Email setup will be available soon.");
    });
  }

  // Trademark Service
  const trademarkBtn = document.querySelector("#trademarkBtn");

  if (trademarkBtn) {
    trademarkBtn.addEventListener("click", () => {
      alert("VIONORA Trademark Service request started.");
    });
  }

  console.log("VIONORA website loaded successfully.");
});
