document.addEventListener("DOMContentLoaded", async () => {

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const cfg = window.VIONORA_CONFIG || {};
  const msg = document.getElementById("authMessage");

  if (
    !cfg.SUPABASE_URL ||
    !cfg.SUPABASE_ANON_KEY ||
    cfg.SUPABASE_URL.includes("PASTE_") ||
    cfg.SUPABASE_ANON_KEY.includes("PASTE_")
  ) {
    if (msg) {
      msg.textContent =
        "Supabase URL and ANON key are not configured yet.";
    }
    return;
  }

  const client = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );

  const loginForm =
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");

  const authCard =
    document.getElementById("authCard");

  const dashboardCard =
    document.getElementById("dashboardCard");

  const loginTab =
    document.getElementById("loginTab");

  const signupTab =
    document.getElementById("signupTab");


  function showTab(type) {

    const isLogin = type === "login";

    loginForm.classList.toggle(
      "hidden",
      !isLogin
    );

    signupForm.classList.toggle(
      "hidden",
      isLogin
    );

    loginTab.classList.toggle(
      "active",
      isLogin
    );

    signupTab.classList.toggle(
      "active",
      !isLogin
    );

    if (msg) {
      msg.textContent = "";
    }
  }


  loginTab.addEventListener(
    "click",
    () => showTab("login")
  );

  signupTab.addEventListener(
    "click",
    () => showTab("signup")
  );


  async function loadDashboard(user) {

    authCard.classList.add("hidden");

    dashboardCard.classList.remove(
      "hidden"
    );

    const profileEmail =
      document.getElementById(
        "profileEmail"
      );

    const profileId =
      document.getElementById(
        "profileId"
      );

    if (profileEmail) {
      profileEmail.textContent =
        user.email || "-";
    }

    if (profileId) {
      profileId.textContent =
        user.id || "-";
    }


    const { data: profile } =
      await client
        .from("profiles")
        .select(
          "full_name, phone"
        )
        .eq("id", user.id)
        .maybeSingle();


    const welcomeName =
      document.getElementById(
        "welcomeName"
      );

    if (welcomeName) {
  welcomeName.textContent =
    `Welcome, ${
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Customer"
    }`;
}


    const profilePhone =
      document.getElementById(
        "profilePhone"
      );

    if (profilePhone) {
  profilePhone.textContent =
    profile?.phone ||
    user.user_metadata?.phone ||
    "-";
}


    const {
      count: orderCount
    } = await client
      .from("orders")
      .select(
        "*",
        {
          count: "exact",
          head: true
        }
      )
      .eq(
        "user_id",
        user.id
      );


    const {
      count: domainCount
    } = await client
      .from("orders")
      .select(
        "*",
        {
          count: "exact",
          head: true
        }
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "service_type",
        "domain"
      );


    const {
      count: hostingCount
    } = await client
      .from("orders")
      .select(
        "*",
        {
          count: "exact",
          head: true
        }
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "service_type",
        "hosting"
      );


    const {
      count: tmCount
    } = await client
      .from("orders")
      .select(
        "*",
        {
          count: "exact",
          head: true
        }
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "service_type",
        "trademark"
      );


    const orderEl =
      document.getElementById(
        "orderCount"
      );

    const domainEl =
      document.getElementById(
        "domainCount"
      );

    const hostingEl =
      document.getElementById(
        "hostingCount"
      );

    const tmEl =
      document.getElementById(
        "tmCount"
      );


    if (orderEl) {
      orderEl.textContent =
        orderCount || 0;
    }

    if (domainEl) {
      domainEl.textContent =
        domainCount || 0;
    }

    if (hostingEl) {
      hostingEl.textContent =
        hostingCount || 0;
    }

    if (tmEl) {
      tmEl.textContent =
        tmCount || 0;
    }
  }


  async function showAuth() {

    dashboardCard.classList.add(
      "hidden"
    );

    authCard.classList.remove(
      "hidden"
    );
  }


  signupForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      if (msg) {
        msg.textContent =
          "Creating account...";
      }


      const fullName =
        document
          .getElementById(
            "signupName"
          )
          .value
          .trim();

      const email =
        document
          .getElementById(
            "signupEmail"
          )
          .value
          .trim();

      const phone =
        document
          .getElementById(
            "signupPhone"
          )
          .value
          .trim();

      const password =
        document
          .getElementById(
            "signupPassword"
          )
          .value;


      const {
        data,
        error
      } =
        await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });


      if (error) {

        if (msg) {
          msg.textContent =
            error.message;
        }

        return;
      }


      if (msg) {
        msg.textContent =
          "Account created. Check your email if confirmation is enabled.";
      }


      if (data.user) {

        await client
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: fullName,
            phone: phone
          });
      }
    }
  );


  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      if (msg) {
        msg.textContent =
          "Logging in...";
      }


      const email =
        document
          .getElementById(
            "loginEmail"
          )
          .value
          .trim();

      const password =
        document
          .getElementById(
            "loginPassword"
          )
          .value;


      const {
        data,
        error
      } =
        await client.auth
          .signInWithPassword({
            email,
            password
          });


      if (error) {

        if (msg) {
          msg.textContent =
            error.message;
        }

        return;
      }


      if (msg) {
        msg.textContent = "";
      }


      if (data.user) {

        await loadDashboard(
          data.user
        );
      }
    }
  );


  const forgotBtn =
    document.getElementById(
      "forgotBtn"
    );


  if (forgotBtn) {

    forgotBtn.addEventListener(
      "click",
      async () => {

        const email =
          document
            .getElementById(
              "loginEmail"
            )
            .value
            .trim() ||
          prompt(
            "Enter your email:"
          );


        if (!email) {
          return;
        }


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


        if (msg) {

          msg.textContent =
            error
              ? error.message
              : "Password reset email sent.";
        }
      }
    );
  }


  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );


  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async () => {

        await client.auth.signOut();

        await showAuth();
      }
    );
  }


  const {
    data: {
      session
    }
  } =
    await client.auth.getSession();


  if (session?.user) {

    await loadDashboard(
      session.user
    );
  }


  client.auth.onAuthStateChange(
    async (
      _event,
      session
    ) => {

      if (session?.user) {

        await loadDashboard(
          session.user
        );

      } else {

        await showAuth();
      }
    }
  );
const createOrderBtn = document.getElementById("createOrderBtn");

if (createOrderBtn) {
  createOrderBtn.addEventListener("click", async () => {

    const serviceType =
      document.getElementById("serviceType").value;

    const serviceName =
      document.getElementById("serviceName").value.trim();

    const orderMessage =
      document.getElementById("orderMessage");

    if (!serviceType || !serviceName) {
      orderMessage.textContent =
        "Please select a service and enter details.";
      return;
    }

    const {
      data: { user }
    } = await client.auth.getUser();

    if (!user) {
      orderMessage.textContent =
        "Please login first.";
      return;
    }

    orderMessage.textContent =
      "Creating order...";

    const { error } = await client
      .from("orders")
      .insert({
        user_id: user.id,
        service_type: serviceType,
        service_name: serviceName
      });

    if (error) {
      console.error(error);
      orderMessage.textContent =
        "Order failed: " + error.message;
      return;
    }

    orderMessage.textContent =
      "Order created successfully!";

    document.getElementById("serviceName").value = "";
    document.getElementById("serviceType").value = "";

    await loadDashboard(user);
  });
}
  const generateDomainsBtn =
  document.getElementById("generateDomainsBtn");

if (generateDomainsBtn) {
  generateDomainsBtn.addEventListener("click", async () => {

    const input =
      document.getElementById("domainSearchInput");

    const result =
      document.getElementById("domainSuggestions");

    let name = input.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

    if (!name) {
      result.innerHTML =
        "<p>Please enter a business or brand name.</p>";
      return;
    }

    const domains = [
      `${name}.com`,
      `${name}.in`,
      `${name}.net`,
      `${name}.co.in`,
      `${name}.org`,
      `get${name}.com`,
      `${name}online.com`,
      `${name}india.com`
    ];

    result.innerHTML =
      "<h4>Checking Domain Availability...</h4>";

    const checkedDomains = [];

    for (const domain of domains) {

      const { data, error } =
        await client.functions.invoke(
          "check-domain",
          {
            body: { domain }
          }
        );

      if (error) {
        checkedDomains.push({
          domain,
          status: "error",
          available: null
        });
      } else {
        checkedDomains.push(data);
      }
    }

    result.innerHTML =
      "<h4>Domain Availability</h4>" +
      checkedDomains
        .map(item => {

          if (item.available === true) {
            return `
              <div class="domain-result">
                <span>${item.domain}</span>
                <strong>✅ Available</strong>
                <button
                  type="button"
                  class="select-domain-btn"
                  data-domain="${item.domain}">
                  Select
                </button>
              </div>
            `;
          }

          if (item.available === false) {
            return `
              <div class="domain-result">
                <span>${item.domain}</span>
                <strong>❌ Registered</strong>
              </div>
            `;
          }

          return `
            <div class="domain-result">
              <span>${item.domain}</span>
              <strong>⚠️ Unable to check</strong>
            </div>
          `;
        })
        .join("");

    document
      .querySelectorAll(".select-domain-btn")
      .forEach(button => {

        button.addEventListener("click", () => {

          document.getElementById("serviceType").value =
            "domain";

          document.getElementById("serviceName").value =
            button.dataset.domain;

          document
            .getElementById("serviceName")
            .scrollIntoView({
              behavior: "smooth"
            });
        });

      });

  });})();
}
}
})();
