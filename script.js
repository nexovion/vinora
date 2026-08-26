/* =========================================================
   VIONORA™ MASTER SCRIPT
   Login • Signup • Dashboard • Domains • Hosting
   Trademark • Logo Trademark • Orders • Razorpay
   Payment • Success • Certificate
   ========================================================= */

"use strict";

/* =========================================================
   01. CONFIG + SUPABASE
   ========================================================= */

if (
  !window.VIONORA_CONFIG ||
  !window.VIONORA_CONFIG.SUPABASE_URL ||
  !window.VIONORA_CONFIG.SUPABASE_ANON_KEY
) {
  alert("VIONORA configuration missing. Please check config.js");
  throw new Error("VIONORA_CONFIG missing");
}

const client = supabase.createClient(
  window.VIONORA_CONFIG.SUPABASE_URL,
  window.VIONORA_CONFIG.SUPABASE_ANON_KEY
);

/* =========================================================
   02. APP STATE
   ========================================================= */

let currentUser = null;
let currentProfile = null;
let currentOrders = [];

let selectedOrder = null;

let activeDbOrder = null;

let paymentState = {
  serviceType: "",
  serviceName: "",
  displayService: "",
  item: "",
  externalFee: 0,
  vionoraFee: 0,
  taxAmount: 0,
  totalAmount: 0,
  metadata: {}
};

let lastSuccessfulPayment = null;


/* =========================================================
   03. DOMAIN PRICE MASTER
   ========================================================= */

const DOMAIN_PRICES = {
  ".com": 699,
  ".in": 599,
  ".co.in": 399,
  ".net": 799,
  ".org": 899,
  ".ai": 3999,
  ".online": 249,
  ".tech": 999
};

const DOMAIN_EXTENSIONS = [
  ".com",
  ".in",
  ".co.in",
  ".net",
  ".org",
  ".ai",
  ".online",
  ".tech"
];


/* =========================================================
   04. DOM HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

function money(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function safeText(value, fallback = "-") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normaliseDomainName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9.-]/g, "")
    .replace(/^\.+|\.+$/g, "");
}

function generateReference(prefix = "VIO") {
  const now = Date.now().toString().slice(-8);
  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `${prefix}${now}${random}`;
}

function showMessage(id, text, isError = false) {
  const el = $(id);

  if (!el) return;

  el.textContent = text || "";

  el.style.color = isError
    ? "#ff7070"
    : "#4ee39b";
}


/* =========================================================
   05. PAGE NAVIGATION
   ========================================================= */

const PAGE_IDS = [
  "authPage",
  "dashboardPage",
  "domainPage",
  "hostingPage",
  "trademarkPage",
  "logoTrademarkPage",
  "paymentPage",
  "successPage",
  "certificatePage"
];

function showPage(pageId, scrollTop = true) {

  PAGE_IDS.forEach(id => {

    const page = $(id);

    if (!page) return;

    page.classList.toggle(
      "hidden",
      id !== pageId
    );

  });

  const mobileNav = $("mobileNav");

  if (mobileNav) {
    mobileNav.classList.add("hidden");
  }

  if (scrollTop) {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

function openServicePage(pageId) {

  if (!currentUser) {
    showPage("authPage");

    showMessage(
      "authMessage",
      "Please login to continue.",
      true
    );

    return;
  }

  showPage(pageId);
}


/* =========================================================
   06. HEADER / NAVIGATION
   ========================================================= */

document.querySelectorAll("[data-page]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const pageId =
          button.dataset.page;

        openServicePage(pageId);

      }
    );

  });

document.querySelectorAll("[data-scroll]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const target =
          document.getElementById(
            button.dataset.scroll
          );

        target?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  });

$("brandHome")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    if (currentUser) {
      showPage("dashboardPage");
    } else {
      showPage("authPage");
    }

  }
);

$("headerLoginBtn")?.addEventListener(
  "click",
  () => {

    if (currentUser) {
      showPage("dashboardPage");
    } else {
      showPage("authPage");
    }

  }
);

$("mobileMenuBtn")?.addEventListener(
  "click",
  () => {

    $("mobileNav")?.classList.toggle(
      "hidden"
    );

  }
);


/* =========================================================
   07. LOGIN / SIGNUP TABS
   ========================================================= */

function showLoginTab() {

  $("loginTab")?.classList.add(
    "active"
  );

  $("signupTab")?.classList.remove(
    "active"
  );

  $("loginForm")?.classList.remove(
    "hidden"
  );

  $("signupForm")?.classList.add(
    "hidden"
  );

  showMessage("authMessage", "");
}

function showSignupTab() {

  $("signupTab")?.classList.add(
    "active"
  );

  $("loginTab")?.classList.remove(
    "active"
  );

  $("signupForm")?.classList.remove(
    "hidden"
  );

  $("loginForm")?.classList.add(
    "hidden"
  );

  showMessage("authMessage", "");
}

$("loginTab")?.addEventListener(
  "click",
  showLoginTab
);

$("signupTab")?.addEventListener(
  "click",
  showSignupTab
);


/* =========================================================
   08. PASSWORD SHOW / HIDE
   ========================================================= */

document
  .querySelectorAll(".password-toggle")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const input =
          document.getElementById(
            button.dataset.target
          );

        if (!input) return;

        if (input.type === "password") {
          input.type = "text";
          button.textContent = "◉";
        } else {
          input.type = "password";
          button.textContent = "◉";
        }

      }
    );

  });


/* =========================================================
   09. SIGNUP
   ========================================================= */

$("signupForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const fullName =
      $("signupName")?.value.trim();

    const email =
      $("signupEmail")?.value.trim();

    const phone =
      $("signupPhone")?.value.trim();

    const password =
      $("signupPassword")?.value;

    if (
      !fullName ||
      !email ||
      !phone ||
      !password
    ) {

      showMessage(
        "authMessage",
        "Please complete all fields.",
        true
      );

      return;
    }

    showMessage(
      "authMessage",
      "Creating your VIONORA account..."
    );

    try {

      const {
        data,
        error
      } = await client.auth.signUp({

        email,

        password,

        options: {

          data: {
            full_name: fullName,
            phone: phone
          }

        }

      });

      if (error) throw error;

      /*
       Trigger handle_new_user()
       automatically creates profile.
      */

      if (data?.user) {

        /*
         Safe upsert in case trigger/profile
         requires additional update.
        */

        try {

          await client
            .from("profiles")
            .upsert({
              id: data.user.id,
              full_name: fullName,
              phone: phone
            });

        } catch (_) {}

      }

      $("signupForm")?.reset();

      showMessage(
        "authMessage",
        data?.session
          ? "Account created successfully."
          : "Account created. Please check your email to verify your account."
      );

      if (data?.session) {

        await handleLoggedInUser(
          data.user
        );

      } else {

        showLoginTab();

      }

    } catch (error) {

      console.error(error);

      showMessage(
        "authMessage",
        error.message ||
        "Unable to create account.",
        true
      );

    }

  }
);


/* =========================================================
   10. LOGIN
   ========================================================= */

$("loginForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const email =
      $("loginEmail")?.value.trim();

    const password =
      $("loginPassword")?.value;

    if (!email || !password) {

      showMessage(
        "authMessage",
        "Enter your email and password.",
        true
      );

      return;
    }

    showMessage(
      "authMessage",
      "Logging in..."
    );

    try {

      const {
        data,
        error
      } =
        await client.auth
          .signInWithPassword({
            email,
            password
          });

      if (error) throw error;

      if (!data?.user) {
        throw new Error(
          "Unable to login."
        );
      }

      showMessage(
        "authMessage",
        "Login successful."
      );

      await handleLoggedInUser(
        data.user
      );

    } catch (error) {

      console.error(error);

      showMessage(
        "authMessage",
        error.message ||
        "Login failed.",
        true
      );

    }

  }
);


/* =========================================================
   11. FORGOT PASSWORD
   ========================================================= */

$("forgotBtn")?.addEventListener(
  "click",
  async () => {

    const email =
      $("loginEmail")?.value.trim();

    if (!email) {

      showMessage(
        "authMessage",
        "Enter your email address first.",
        true
      );

      return;
    }

    try {

      const {
        error
      } =
        await client.auth
          .resetPasswordForEmail(
            email,
            {
              redirectTo:
                window.location.origin +
                window.location.pathname
            }
          );

      if (error) throw error;

      showMessage(
        "authMessage",
        "Password reset link sent to your email."
      );

    } catch (error) {

      showMessage(
        "authMessage",
        error.message,
        true
      );

    }

  }
);


/* =========================================================
   12. LOGOUT
   ========================================================= */

$("logoutBtn")?.addEventListener(
  "click",
  async () => {

    try {
      await client.auth.signOut();
    } catch (_) {}

    currentUser = null;
    currentProfile = null;
    currentOrders = [];

    activeDbOrder = null;
    lastSuccessfulPayment = null;

    showLoginTab();
    showPage("authPage");

  }
);


/* =========================================================
   13. PROFILE LOADING
   ========================================================= */

async function loadProfile(user) {

  /*
   Current VIONORA database is expected to have:
   full_name
   phone
   customer_number
   user_id
   role
  */

  let profile = null;

  const fullQuery =
    await client
      .from("profiles")
      .select(
        "id, full_name, phone, customer_number, user_id, role"
      )
      .eq("id", user.id)
      .maybeSingle();

  if (!fullQuery.error) {

    profile = fullQuery.data;

  } else {

    /*
     Fallback if optional columns
     don't exist in an older database.
    */

    const fallback =
      await client
        .from("profiles")
        .select(
          "id, full_name, phone"
        )
        .eq("id", user.id)
        .maybeSingle();

    if (!fallback.error) {
      profile = fallback.data;
    }

  }

  return profile || {
    id: user.id,
    full_name:
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Customer",
    phone:
      user.user_metadata?.phone ||
      ""
  };
}


/* =========================================================
   14. VIO USER ID
   ========================================================= */

function getVioUserId(profile) {

  if (profile?.user_id) {
    return profile.user_id;
  }

  if (profile?.customer_number) {
    return `VIO${profile.customer_number}`;
  }

  return "-";
}


/* =========================================================
   15. LOGGED-IN USER
   ========================================================= */

async function handleLoggedInUser(user) {

  currentUser = user;

  currentProfile =
    await loadProfile(user);

  renderProfile();

  await loadCustomerOrders();

  showPage(
    "dashboardPage",
    false
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   16. PROFILE RENDER
   ========================================================= */

function renderProfile() {

  if (!currentUser) return;

  const fullName =
    currentProfile?.full_name ||
    currentUser.user_metadata?.full_name ||
    currentUser.email?.split("@")[0] ||
    "Customer";

  const phone =
    currentProfile?.phone ||
    currentUser.user_metadata?.phone ||
    "-";

  const userId =
    getVioUserId(
      currentProfile
    );

  if ($("welcomeName")) {
    $("welcomeName").textContent =
      `Welcome, ${fullName}`;
  }

  if ($("profileEmail")) {
    $("profileEmail").textContent =
      currentUser.email || "-";
  }

  if ($("profilePhone")) {
    $("profilePhone").textContent =
      phone;
  }

  if ($("profileId")) {
    $("profileId").textContent =
      userId;
  }

  if ($("headerLoginBtn")) {
    $("headerLoginBtn").textContent =
      "My Account";
  }
}


/* =========================================================
   17. CUSTOMER ORDERS
   ========================================================= */

async function loadCustomerOrders() {

  if (!currentUser) return;

  try {

    const {
      data,
      error
    } =
      await client
        .from("orders")
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) throw error;

    currentOrders =
      data || [];

    renderDashboardCounts();

    renderCustomerOrders();

  } catch (error) {

    console.error(
      "Order load error:",
      error
    );

    currentOrders = [];

    renderDashboardCounts();
    renderCustomerOrders();

  }

}


/* =========================================================
   18. DASHBOARD COUNTS
   ========================================================= */

function renderDashboardCounts() {

  const domainCount =
    currentOrders.filter(
      order =>
        order.service_type ===
        "domain"
    ).length;

  const hostingCount =
    currentOrders.filter(
      order =>
        order.service_type ===
        "hosting"
    ).length;

  const trademarkCount =
    currentOrders.filter(
      order =>
        order.service_type ===
        "trademark"
    ).length;

  if ($("domainCount")) {
    $("domainCount").textContent =
      domainCount;
  }

  if ($("hostingCount")) {
    $("hostingCount").textContent =
      hostingCount;
  }

  if ($("tmCount")) {
    $("tmCount").textContent =
      trademarkCount;
  }

  if ($("orderCount")) {
    $("orderCount").textContent =
      currentOrders.length;
  }

}


/* =========================================================
   19. CUSTOMER ORDER LIST
   ========================================================= */

function renderCustomerOrders() {

  const container =
    $("customerOrders");

  if (!container) return;

  if (!currentOrders.length) {

    container.innerHTML = `
      <p class="empty-state">
        Your orders will appear here.
      </p>
    `;

    return;
  }

  container.innerHTML =
    currentOrders
      .slice(0, 10)
      .map(order => {

        const created =
          order.created_at
            ? new Date(
                order.created_at
              ).toLocaleDateString()
            : "-";

        return `
          <div
            style="
              display:grid;
              grid-template-columns:1fr auto;
              gap:12px;
              padding:15px;
              margin-bottom:10px;
              border:1px solid rgba(112,135,180,.18);
              border-radius:14px;
              background:#07101b;
            "
          >
            <div>
              <strong>
                ${escapeHtml(
                  order.service_name
                )}
              </strong>

              <div
                style="
                  color:#98a7bd;
                  font-size:12px;
                  margin-top:5px;
                "
              >
                ${escapeHtml(
                  order.service_type
                )}
                •
                ${created}
              </div>
            </div>

            <div
              style="
                text-align:right;
              "
            >
              <strong>
                ${money(
                  order.total_amount
                )}
              </strong>

              <div
                style="
                  color:#98a7bd;
                  font-size:11px;
                  margin-top:5px;
                "
              >
                ${escapeHtml(
                  order.payment_status ||
                  "pending"
                )}
              </div>
            </div>
          </div>
        `;

      })
      .join("");

}


/* =========================================================
   20. DOMAIN SEARCH
   ========================================================= */

$("generateDomainsBtn")
  ?.addEventListener(
    "click",
    searchDomains
  );

$("domainSearchInput")
  ?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        event.preventDefault();
        searchDomains();
      }

    }
  );


async function searchDomains() {

  const rawName =
    $("domainSearchInput")
      ?.value.trim();

  if (!rawName) {

    $("domainSuggestions").innerHTML = `
      <div class="domain-empty-state">
        Please enter your brand or business name.
      </div>
    `;

    return;
  }

  const cleanInput =
    normaliseDomainName(rawName);

  if (!cleanInput) {

    $("domainSuggestions").innerHTML = `
      <div class="domain-empty-state">
        Please enter a valid domain or brand name.
      </div>
    `;

    return;
  }

  $("domainSuggestions").innerHTML = `
    <div class="domain-empty-state">
      Searching domains...
    </div>
  `;

  const primaryExtension =
    $("domainPrimaryExtension")
      ?.value || ".com";

  /*
   If user enters full domain,
   check it directly.
  */

  const hasExtension =
    cleanInput.includes(".");

  const baseName =
    hasExtension
      ? cleanInput.split(".")[0]
      : cleanInput;

  const generatedDomains = [
    hasExtension
      ? cleanInput
      : `${baseName}${primaryExtension}`,

    `${baseName}.com`,
    `${baseName}.in`,
    `get${baseName}.com`,
    `${baseName}.co.in`,
    `${baseName}.net`,
    `${baseName}.org`,
    `${baseName}.ai`,
    `${baseName}.online`
  ];

  const uniqueDomains =
    [...new Set(
      generatedDomains
    )];

  const results = [];

  for (const domain of uniqueDomains) {

    const availability =
      await checkDomainAvailability(
        domain
      );

    results.push({
      domain,
      ...availability
    });

  }

  renderDomainResults(
    results
  );

}


/* =========================================================
   21. CHECK-DOMAIN EDGE FUNCTION
   ========================================================= */

async function checkDomainAvailability(
  domain
) {

  try {

    const {
      data,
      error
    } =
      await client.functions.invoke(
        "check-domain",
        {
          body: {
            domain,
            name: domain
          }
        }
      );

    if (error) {
      throw error;
    }

    /*
     Flexible response handling.
     Supports common Edge Function response formats.
    */

    let available = null;

    if (
      typeof data?.available ===
      "boolean"
    ) {
      available =
        data.available;
    }

    else if (
      typeof data?.isAvailable ===
      "boolean"
    ) {
      available =
        data.isAvailable;
    }

    else if (
      typeof data?.result?.available ===
      "boolean"
    ) {
      available =
        data.result.available;
    }

    else if (
      String(
        data?.status || ""
      ).toLowerCase() ===
      "available"
    ) {
      available = true;
    }

    else if (
      String(
        data?.status || ""
      ).toLowerCase() ===
      "taken"
    ) {
      available = false;
    }

    return {
      available,
      sourceData: data
    };

  } catch (error) {

    console.warn(
      `Domain check failed for ${domain}`,
      error
    );

    /*
     We do NOT falsely claim availability.
    */

    return {
      available: null,
      sourceData: null
    };

  }

}


/* =========================================================
   22. DOMAIN PRICE
   ========================================================= */

function getDomainExtension(
  domain
) {

  if (
    domain.endsWith(".co.in")
  ) {
    return ".co.in";
  }

  return (
    DOMAIN_EXTENSIONS.find(
      ext =>
        domain.endsWith(ext)
    ) || ".com"
  );
}

function getDomainPrice(domain) {

  const extension =
    getDomainExtension(
      domain
    );

  return (
    DOMAIN_PRICES[
      extension
    ] || 799
  );

}


/* =========================================================
   23. DOMAIN RESULTS
   ========================================================= */

function renderDomainResults(
  results
) {

  const container =
    $("domainSuggestions");

  if (!container) return;

  container.innerHTML =
    results
      .map(result => {

        const price =
          getDomainPrice(
            result.domain
          );

        let statusHtml = `
          <strong
            style="color:#ffc965;"
          >
            Check required
          </strong>
        `;

        let buttonDisabled = "";

        if (
          result.available === true
        ) {

          statusHtml = `
            <strong
              style="color:#4ee39b;"
            >
              Available
            </strong>
          `;

        }

        else if (
          result.available === false
        ) {

          statusHtml = `
            <strong
              style="color:#ff7070;"
            >
              Taken
            </strong>
          `;

          buttonDisabled =
            "disabled";

        }

        return `
          <div class="domain-result">

            <span>
              ${escapeHtml(
                result.domain
              )}
            </span>

            ${statusHtml}

            <strong>
              ${money(price)}/yr
            </strong>

            <button
              type="button"
              class="select-domain-btn"
              data-domain="${escapeHtml(
                result.domain
              )}"
              data-price="${price}"
              ${buttonDisabled}
            >
              ${
                result.available === false
                  ? "Unavailable"
                  : "Select"
              }
            </button>

          </div>
        `;

      })
      .join("");

  container
    .querySelectorAll(
      ".select-domain-btn:not([disabled])"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const domain =
            button.dataset.domain;

          const price =
            Number(
              button.dataset.price
            );

          openOrderModal({
            serviceType:
              "domain",

            displayService:
              "Domain Registration",

            serviceName:
              domain,

            item:
              domain,

            externalFee:
              price,

            vionoraFee:
              0,

            taxAmount:
              0,

            metadata: {
              domain,
              period:
                "1 year"
            }
          });

        }
      );

    });

}


/* =========================================================
   24. HOSTING BUTTONS
   ========================================================= */

document
  .querySelectorAll(
    ".hosting-buy-btn"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const plan =
          button.dataset.plan;

        const price =
          Number(
            button.dataset.price ||
            0
          );

        openOrderModal({

          serviceType:
            "hosting",

          displayService:
            "Web Hosting",

          serviceName:
            plan,

          item:
            plan,

          externalFee:
            price,

          vionoraFee:
            0,

          taxAmount:
            0,

          metadata: {
            plan,
            billing:
              "monthly"
          }

        });

      }
    );

  });


/* =========================================================
   25. TRADEMARK FORM
   ========================================================= */

$("trademarkForm")
  ?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const applicantType =
        $("tmApplicantType")?.value;

      const applicantName =
        $("tmApplicantName")
          ?.value.trim();

      const brandName =
        $("tmBrandName")
          ?.value.trim();

      const trademarkClass =
        $("tmClass")?.value;

      const description =
        $("tmDescription")
          ?.value.trim();

      if (
        !applicantType ||
        !applicantName ||
        !brandName ||
        !trademarkClass ||
        !description
      ) {

        showMessage(
          "trademarkMessage",
          "Please complete all trademark details.",
          true
        );

        return;
      }

      showMessage(
        "trademarkMessage",
        ""
      );

      openOrderModal({

        /*
         Database constraint supports
         "trademark".
        */

        serviceType:
          "trademark",

        displayService:
          "Trademark Service",

        serviceName:
          brandName,

        item:
          `${brandName} — Class ${trademarkClass}`,

        /*
         Government fee is deliberately
         NOT guessed.
        */

        externalFee:
          0,

        vionoraFee:
          999,

        taxAmount:
          0,

        metadata: {

          subtype:
            "word_trademark",

          applicant_type:
            applicantType,

          applicant_name:
            applicantName,

          brand_name:
            brandName,

          trademark_class:
            trademarkClass,

          description,

          government_fee:
            "separate_as_applicable"

        }

      });

    }
  );


/* =========================================================
   26. LOGO TRADEMARK FORM
   ========================================================= */

$("logoTrademarkForm")
  ?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const file =
        $("logoTrademarkFile")
          ?.files?.[0];

      const applicantType =
        $("logoApplicantType")
          ?.value;

      const applicantName =
        $("logoApplicantName")
          ?.value.trim();

      const brandName =
        $("logoBrandName")
          ?.value.trim();

      const trademarkClass =
        $("logoTrademarkClass")
          ?.value;

      const description =
        $("logoDescription")
          ?.value.trim();

      if (
        !file ||
        !applicantType ||
        !applicantName ||
        !brandName ||
        !trademarkClass ||
        !description
      ) {

        showMessage(
          "logoTrademarkMessage",
          "Please complete all logo trademark details.",
          true
        );

        return;
      }

      /*
       At this stage we store safe file metadata.
       Actual binary upload requires an approved
       Supabase Storage bucket.
      */

      const logoMeta = {
        file_name:
          file.name,

        file_type:
          file.type,

        file_size:
          file.size
      };

      showMessage(
        "logoTrademarkMessage",
        ""
      );

      openOrderModal({

        /*
         orders table constraint only
         permits "trademark".
        */

        serviceType:
          "trademark",

        displayService:
          "Logo Trademark Service",

        serviceName:
          brandName,

        item:
          `${brandName} Logo — Class ${trademarkClass}`,

        externalFee:
          0,

        vionoraFee:
          999,

        taxAmount:
          0,

        metadata: {

          subtype:
            "logo_trademark",

          applicant_type:
            applicantType,

          applicant_name:
            applicantName,

          brand_name:
            brandName,

          trademark_class:
            trademarkClass,

          description,

          logo_file:
            logoMeta,

          government_fee:
            "separate_as_applicable"

        }

      });

    }
  );


/* =========================================================
   27. ORDER MODAL
   ========================================================= */

function openOrderModal(order) {

  if (!currentUser) {

    showPage("authPage");

    showMessage(
      "authMessage",
      "Please login to continue.",
      true
    );

    return;
  }

  selectedOrder = {

    serviceType:
      order.serviceType,

    displayService:
      order.displayService,

    serviceName:
      order.serviceName,

    item:
      order.item,

    externalFee:
      Number(
        order.externalFee || 0
      ),

    vionoraFee:
      Math.min(
        999,
        Math.max(
          0,
          Number(
            order.vionoraFee || 0
          )
        )
      ),

    taxAmount:
      Number(
        order.taxAmount || 0
      ),

    metadata:
      order.metadata || {}

  };

  selectedOrder.totalAmount =
    selectedOrder.externalFee +
    selectedOrder.vionoraFee +
    selectedOrder.taxAmount;

  if ($("modalService")) {
    $("modalService").textContent =
      selectedOrder.displayService;
  }

  if ($("modalItem")) {
    $("modalItem").textContent =
      selectedOrder.item;
  }

  if ($("modalPrice")) {
    $("modalPrice").textContent =
      money(
        selectedOrder.totalAmount
      );
  }

  $("orderModal")
    ?.classList.remove(
      "hidden"
    );

  $("orderModal")
    ?.setAttribute(
      "aria-hidden",
      "false"
    );

  showMessage(
    "orderMessage",
    ""
  );

}

function closeOrderModal() {

  $("orderModal")
    ?.classList.add(
      "hidden"
    );

  $("orderModal")
    ?.setAttribute(
      "aria-hidden",
      "true"
    );

}

$("closeOrderModal")
  ?.addEventListener(
    "click",
    closeOrderModal
  );

document
  .querySelector(
    "#orderModal .modal-backdrop"
  )
  ?.addEventListener(
    "click",
    closeOrderModal
  );


/* =========================================================
   28. CREATE ORDER
   ========================================================= */

$("createOrderBtn")
  ?.addEventListener(
    "click",
    async () => {

      if (
        !currentUser ||
        !selectedOrder
      ) {
        return;
      }

      showMessage(
        "orderMessage",
        "Creating order..."
      );

      try {

        const orderPayload = {

          user_id:
            currentUser.id,

          service_type:
            selectedOrder.serviceType,

          service_name:
            selectedOrder.serviceName,

          external_fee:
            selectedOrder.externalFee,

          vionora_fee:
            selectedOrder.vionoraFee,

          tax_amount:
            selectedOrder.taxAmount,

          payment_status:
            "pending",

          order_status:
            "new",

          metadata: {
            ...selectedOrder.metadata,

            display_service:
              selectedOrder.displayService,

            item:
              selectedOrder.item,

            customer_user_id:
              getVioUserId(
                currentProfile
              )
          }

        };

        const {
          data,
          error
        } =
          await client
            .from("orders")
            .insert(
              orderPayload
            )
            .select()
            .single();

        if (error) {
          throw error;
        }

        activeDbOrder = data;

        paymentState = {

          serviceType:
            selectedOrder.serviceType,

          serviceName:
            selectedOrder.serviceName,

          displayService:
            selectedOrder.displayService,

          item:
            selectedOrder.item,

          externalFee:
            selectedOrder.externalFee,

          vionoraFee:
            selectedOrder.vionoraFee,

          taxAmount:
            selectedOrder.taxAmount,

          totalAmount:
            Number(
              data.total_amount ||
              selectedOrder.totalAmount
            ),

          metadata:
            selectedOrder.metadata

        };

        closeOrderModal();

        renderPaymentPage();

        showPage(
          "paymentPage"
        );

        await loadCustomerOrders();

      } catch (error) {

        console.error(
          "Create order error:",
          error
        );

        let message =
          error.message ||
          "Unable to create order.";

        if (
          message.toLowerCase()
            .includes(
              "row-level security"
            )
        ) {

          message =
            "Order creation is blocked by database security policy. Add the customer INSERT policy for orders.";

        }

        showMessage(
          "orderMessage",
          message,
          true
        );

      }

    }
  );


/* =========================================================
   29. PAYMENT PAGE RENDER
   ========================================================= */

function renderPaymentPage() {

  if ($("paymentService")) {
    $("paymentService").textContent =
      paymentState.displayService ||
      "-";
  }

  if ($("paymentItem")) {
    $("paymentItem").textContent =
      paymentState.item ||
      "-";
  }

  if ($("paymentSubtotal")) {
    $("paymentSubtotal").textContent =
      money(
        paymentState.externalFee +
        paymentState.vionoraFee
      );
  }

  if ($("paymentTax")) {
    $("paymentTax").textContent =
      money(
        paymentState.taxAmount
      );
  }

  if ($("paymentTotal")) {
    $("paymentTotal").textContent =
      money(
        paymentState.totalAmount
      );
  }

  if ($("payNowBtn")) {
    $("payNowBtn").textContent =
      `Pay ${money(
        paymentState.totalAmount
      )} Securely`;
  }

  showMessage(
    "paymentMessage",
    ""
  );

}


/* =========================================================
   30. RAZORPAY ORDER
   ========================================================= */

$("payNowBtn")
  ?.addEventListener(
    "click",
    startRazorpayPayment
  );


async function startRazorpayPayment() {

  if (
    !currentUser ||
    !activeDbOrder
  ) {

    showMessage(
      "paymentMessage",
      "Order information is missing.",
      true
    );

    return;
  }

  if (
    !paymentState.totalAmount ||
    paymentState.totalAmount <= 0
  ) {

    showMessage(
      "paymentMessage",
      "Invalid payment amount.",
      true
    );

    return;
  }

  if (
    typeof window.Razorpay !==
    "function"
  ) {

    showMessage(
      "paymentMessage",
      "Razorpay checkout is not available.",
      true
    );

    return;
  }

  showMessage(
    "paymentMessage",
    "Preparing secure payment..."
  );

  try {

    /*
     Edge Function is expected to use
     RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
     from Supabase server secrets.
    */

    const {
      data,
      error
    } =
      await client.functions.invoke(
        "create-razorpay-order",
        {
          body: {

            amount:
              paymentState.totalAmount,

            amount_paise:
              Math.round(
                paymentState.totalAmount *
                100
              ),

            currency:
              "INR",

            receipt:
              activeDbOrder.id,

            order_id:
              activeDbOrder.id,

            service_type:
              paymentState.serviceType,

            service_name:
              paymentState.serviceName

          }
        }
      );

    if (error) throw error;

    const razorpayOrderId =
      data?.razorpay_order_id ||
      data?.order_id ||
      data?.order?.id ||
      data?.id;

    const razorpayKeyId =
      data?.key_id ||
      data?.key ||
      data?.razorpay_key_id ||
      data?.order?.key_id;

    const amountPaise =
      Number(
        data?.amount ||
        data?.order?.amount ||
        Math.round(
          paymentState.totalAmount *
          100
        )
      );

    if (!razorpayOrderId) {

      throw new Error(
        "Razorpay order ID was not returned by the Edge Function."
      );

    }

    if (!razorpayKeyId) {

      throw new Error(
        "Razorpay Key ID was not returned by the Edge Function."
      );

    }

    const options = {

      key:
        razorpayKeyId,

      amount:
        amountPaise,

      currency:
        data?.currency ||
        "INR",

      name:
        "VIONORA™",

      description:
        paymentState.displayService,

      order_id:
        razorpayOrderId,

      prefill: {

        name:
          currentProfile?.full_name ||
          currentUser.user_metadata
            ?.full_name ||
          "",

        email:
          currentUser.email ||
          "",

        contact:
          currentProfile?.phone ||
          currentUser.user_metadata
            ?.phone ||
          ""

      },

      notes: {

        vionora_order_id:
          activeDbOrder.id,

        service_type:
          paymentState.serviceType,

        service_name:
          paymentState.serviceName

      },

      theme: {
        color:
          "#586CFF"
      },

      handler:
        async response => {

          await handleRazorpaySuccess(
            response
          );

      },

      modal: {

        ondismiss: () => {

          showMessage(
            "paymentMessage",
            "Payment window closed.",
            true
          );

        }

      }

    };

    const razorpay =
      new Razorpay(options);

    razorpay.on(
      "payment.failed",
      response => {

        console.error(
          "Payment failed:",
          response
        );

        showMessage(
          "paymentMessage",
          response?.error
            ?.description ||
          "Payment failed.",
          true
        );

      }
    );

    razorpay.open();

  } catch (error) {

    console.error(
      "Razorpay error:",
      error
    );

    showMessage(
      "paymentMessage",
      error.message ||
      "Unable to start payment.",
      true
    );

  }

}


/* =========================================================
   31. PAYMENT VERIFICATION
   ========================================================= */

async function handleRazorpaySuccess(response) {

  if (!activeDbOrder?.id) {
    showMessage(
      "paymentMessage",
      "Order information is missing. Please do not retry payment.",
      true
    );
    return;
  }

  showMessage(
    "paymentMessage",
    "Payment received. Verifying securely..."
  );

  try {

    if (
      !response?.razorpay_order_id ||
      !response?.razorpay_payment_id ||
      !response?.razorpay_signature
    ) {
      throw new Error(
        "Incomplete Razorpay payment response."
      );
    }

    const { data, error } =
      await client.functions.invoke(
        "verify-razorpay-payment",
        {
          body: {
            vionora_order_id: activeDbOrder.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }
        }
      );

    if (error) {
      console.error(
        "Verification function error:",
        error
      );
      throw error;
    }

    console.log(
      "Verification response:",
      data
    );

    const verified =
      data?.verified === true ||
      data?.success === true ||
      String(
        data?.payment_status || ""
      ).toLowerCase() === "paid";

    if (!verified) {
      throw new Error(
        data?.message ||
        "Payment could not be verified."
      );
    }

    const {
      data: refreshedOrder,
      error: refreshError
    } =
      await client
        .from("orders")
        .select("*")
        .eq("id", activeDbOrder.id)
        .maybeSingle();

    if (refreshError) {
      console.warn(
        "Order refresh warning:",
        refreshError
      );
    }

    if (refreshedOrder) {
      activeDbOrder = refreshedOrder;
    }

    lastSuccessfulPayment = {
      orderId: activeDbOrder.id,
      paymentId:
        response.razorpay_payment_id,
      razorpayOrderId:
        response.razorpay_order_id,
      amount:
        paymentState.totalAmount,
      service:
        paymentState.displayService,
      item:
        paymentState.item,
      verified: true,
      verifiedData: data
    };

    showMessage(
      "paymentMessage",
      "Payment verified successfully."
    );

    renderSuccessPage();

    showPage(
      "successPage"
    );

    await loadCustomerOrders();

  } catch (error) {

    console.error(
      "Payment verification error:",
      error
    );

    showMessage(
      "paymentMessage",
      error?.message ||
      "Payment was received, but secure verification could not be completed. Please do not pay again until the order status is checked.",
      true
    );
  }
}
/* =========================================================
   32. SUCCESS PAGE
   ========================================================= */

function renderSuccessPage() {

  if (
    !lastSuccessfulPayment
  ) return;

  if ($("successOrderId")) {
    $("successOrderId").textContent =
      lastSuccessfulPayment.orderId;
  }

  if ($("successPaymentId")) {
    $("successPaymentId").textContent =
      lastSuccessfulPayment.paymentId;
  }

  if ($("successService")) {
    $("successService").textContent =
      lastSuccessfulPayment.service;
  }

  if ($("successAmount")) {
    $("successAmount").textContent =
      money(
        lastSuccessfulPayment.amount
      );
  }

}


/* =========================================================
   33. VIEW CERTIFICATE
   ========================================================= */

$("viewCertificateBtn")
  ?.addEventListener(
    "click",
    () => {

      if (
        !lastSuccessfulPayment
          ?.verified
      ) {

        alert(
          "Certificate is available only after verified payment."
        );

        return;
      }

      renderCertificate();

      showPage(
        "certificatePage"
      );

    }
  );


/* =========================================================
   34. CERTIFICATE RENDER
   ========================================================= */

function renderCertificate() {

  const payment =
    lastSuccessfulPayment;

  if (!payment) return;

  const customerName =
    currentProfile?.full_name ||
    currentUser?.user_metadata
      ?.full_name ||
    currentUser?.email
      ?.split("@")[0] ||
    "Customer";

  const userId =
    getVioUserId(
      currentProfile
    );

  const certificateId =
    `CERT-${generateReference(
      "VIO"
    )}`;

  const issueDate =
    new Date()
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      );

  if ($("certificateCustomerName")) {
    $("certificateCustomerName")
      .textContent =
        customerName;
  }

  if ($("certificateUserId")) {
    $("certificateUserId")
      .textContent =
        userId;
  }

  if ($("certificateService")) {
    $("certificateService")
      .textContent =
        payment.service;
  }

  if ($("certificateItem")) {
    $("certificateItem")
      .textContent =
        payment.item;
  }

  if ($("certificateOrderId")) {
    $("certificateOrderId")
      .textContent =
        payment.orderId;
  }

  if ($("certificateIssueDate")) {
    $("certificateIssueDate")
      .textContent =
        issueDate;
  }

  if ($("certificateId")) {
    $("certificateId")
      .textContent =
        certificateId;
  }

  if ($("certificatePaymentStatus")) {
    $("certificatePaymentStatus")
      .textContent =
        "PAID • VERIFIED";
  }

 /* REAL QR CODE */
const qrBox = $("certificateQr");

if (qrBox && certificateId) {
  const verifyUrl =
    window.location.origin +
    window.location.pathname +
    "?verify=" +
    encodeURIComponent(certificateId);

  qrBox.innerHTML = "";

  const qrImg = document.createElement("img");
  qrImg.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(verifyUrl);

  qrImg.alt = "VIONORA Certificate Verification QR";
  qrImg.width = 180;
  qrImg.height = 180;
  qrImg.style.display = "block";
  qrImg.style.margin = "0 auto";

  qrBox.appendChild(qrImg);
} 


/* =========================================================
   35. CERTIFICATE BUTTONS
   ========================================================= */

$("certificateBackBtn")
  ?.addEventListener(
    "click",
    () => {

      showPage(
        "dashboardPage"
      );

    }
  );

$("downloadCertificateBtn")
  ?.addEventListener(
    "click",
    () => {

      window.print();

    }
  );


/* =========================================================
   36. SUCCESS BUTTONS
   ========================================================= */

$("backDashboardBtn")
  ?.addEventListener(
    "click",
    async () => {

      await loadCustomerOrders();

      showPage(
        "dashboardPage"
      );

    }
  );


/* =========================================================
   37. FOOTER YEAR
   ========================================================= */

if ($("year")) {

  $("year").textContent =
    new Date().getFullYear();

}


/* =========================================================
   38. AUTH STATE
   ========================================================= */

client.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    if (
      event === "SIGNED_OUT"
    ) {

      currentUser = null;
      currentProfile = null;
      currentOrders = [];

      if ($("headerLoginBtn")) {
        $("headerLoginBtn")
          .textContent =
            "Login";
      }

      showPage(
        "authPage"
      );

      return;
    }

    if (
      session?.user &&
      (
        event ===
          "SIGNED_IN" ||
        event ===
          "TOKEN_REFRESHED"
      )
    ) {

      currentUser =
        session.user;

    }

  }
);


/* =========================================================
   39. INITIAL APP LOAD
   ========================================================= */

async function initialiseVionora() {

  try {

    const {
      data: {
        session
      }
    } =
      await client.auth
        .getSession();

    if (
      session?.user
    ) {

      await handleLoggedInUser(
        session.user
      );

    } else {

      showLoginTab();

      showPage(
        "authPage",
        false
      );

    }

  } catch (error) {

    console.error(
      "VIONORA startup error:",
      error
    );

    showPage(
      "authPage",
      false
    );

  }

}
/* =========================================================
   VIONORA ₹5 TEST PAYMENT
   Temporary test only
   ========================================================= */

function openTestPayment() {
  openOrderModal({
    serviceType: "other",
    displayService: "Test Payment",
    serviceName: "VIONORA Test Payment",
    item: "₹5 Payment Test",
    externalFee: 5,
    vionoraFee: 0,
    taxAmount: 0,
    metadata: {
      test_payment: true
    }
  });
}
/* =========================================================
   VIONORA BACK PAGE NAVIGATION
   ========================================================= */

let vionoraCurrentPage = null;
let vionoraPageHistory = [];

/* Existing showPage function-ஐ பாதுகாப்பாக wrap செய்கிறோம் */
const originalShowPage = showPage;

showPage = function(pageId, scrollTop = true) {

  if (
    vionoraCurrentPage &&
    vionoraCurrentPage !== pageId
  ) {

    const lastPage =
      vionoraPageHistory[
        vionoraPageHistory.length - 1
      ];

    if (lastPage !== vionoraCurrentPage) {
      vionoraPageHistory.push(
        vionoraCurrentPage
      );
    }
  }

  originalShowPage(
    pageId,
    scrollTop
  );

  vionoraCurrentPage = pageId;
};


/* Back arrow button */
function goBackPage() {

  let previousPage =
    vionoraPageHistory.pop();

  /* Logged-in customer login page-க்கு திரும்ப வேண்டாம் */
  while (
    currentUser &&
    previousPage === "authPage"
  ) {
    previousPage =
      vionoraPageHistory.pop();
  }

  if (previousPage) {

    originalShowPage(
      previousPage,
      true
    );

    vionoraCurrentPage =
      previousPage;

    return;
  }

  /* Safe fallback */
  if (currentUser) {

    originalShowPage(
      "dashboardPage",
      true
    );

    vionoraCurrentPage =
      "dashboardPage";

  } else {

    originalShowPage(
      "authPage",
      true
    );

    vionoraCurrentPage =
      "authPage";
  }
}
initialiseVionora();


/* =========================================================
   END — VIONORA MASTER SCRIPT
   ========================================================= */
