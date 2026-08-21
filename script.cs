document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('year').textContent =
    new Date().getFullYear();

  const cart = {
    service: '',
    price: 0
  };

  const orders = JSON.parse(
    localStorage.getItem('vionoraOrders') || '[]'
  );

  const session = JSON.parse(
    localStorage.getItem('vionoraSession') || 'null'
  );

  // -------------------------
  // CART
  // -------------------------

  const updateCart = () => {

    document.getElementById('cartService').textContent =
      cart.service || 'No service selected';

    document.getElementById('cartAmount').textContent =
      `₹${cart.price}`;

    document.getElementById('cartTotal').textContent =
      `₹${cart.price}`;
  };


  // -------------------------
  // ORDER HISTORY
  // -------------------------

  const renderOrders = () => {

    const list = document.getElementById('orderList');
    const count = document.getElementById('orderCount');

    count.textContent = orders.length;

    if (!orders.length) {

      list.className = 'orders-empty';

      list.textContent =
        'No demo orders yet.';

      return;
    }

    list.className = '';

    list.innerHTML = orders.map(order => `

      <div class="order-item">

        <div>
          <strong>${order.service}</strong>
          <br>
          <small>${order.date}</small>
        </div>

        <div>
          <strong>₹${order.amount}</strong>
          <br>
          <small>${order.status}</small>
        </div>

      </div>

    `).join('');
  };


  // -------------------------
  // EXISTING LOGIN SESSION
  // -------------------------

  if (session?.name) {

    document.getElementById('dashUser').textContent =
      session.name;
  }


  // -------------------------
  // DOMAIN SEARCH DEMO
  // -------------------------

  document
    .getElementById('domainForm')
    .addEventListener('submit', event => {

      event.preventDefault();

      const name = document
        .getElementById('domainInput')
        .value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');

      const tld =
        document.getElementById('tldSelect').value;

      const result =
        document.getElementById('domainResult');

      result.classList.remove('hidden');

      if (!name) {

        result.textContent =
          'Enter a domain name to search.';

        return;
      }

      result.innerHTML =
        `<strong>${name}${tld}</strong> looks available in this demo.`;

      cart.service =
        `Domain: ${name}${tld}`;

      if (tld === '.in') {

        cart.price = 599;

      } else if (tld === '.co.in') {

        cart.price = 499;

      } else {

        cart.price = 899;
      }

      updateCart();
    });


  // -------------------------
  // SERVICE SELECTION
  // -------------------------

  document
    .querySelectorAll('.choose-service')
    .forEach(button => {

      button.addEventListener('click', () => {

        cart.service =
          button.dataset.service;

        cart.price =
          Number(button.dataset.price || 0);

        updateCart();

        document
          .getElementById('checkout')
          .scrollIntoView({
            behavior: 'smooth'
          });
      });
    });


  // -------------------------
  // AI WEBSITE BUILDER DEMO
  // -------------------------

  document
    .getElementById('generateDemo')
    .addEventListener('click', () => {

      document
        .getElementById('builderMsg')
        .textContent =
        'Demo generated: Home • About • Services • Gallery • Contact';
    });


  // -------------------------
  // CHECKOUT / DEMO PAYMENT
  // -------------------------

  document
    .getElementById('checkoutForm')
    .addEventListener('submit', event => {

      event.preventDefault();

      if (!cart.service) {

        document
          .getElementById('paymentMsg')
          .textContent =
          'Please select a service first.';

        return;
      }

      const order = {

        service: cart.service,

        amount: cart.price,

        status:
          'Demo payment successful',

        date:
          new Date().toLocaleString()
      };

      orders.unshift(order);

      localStorage.setItem(
        'vionoraOrders',
        JSON.stringify(orders)
      );

      document
        .getElementById('paymentMsg')
        .textContent =
        'Demo payment successful. No real money was charged.';

      renderOrders();
    });


  // -------------------------
  // LOGIN / SIGNUP MODAL
  // -------------------------

  const modal =
    document.getElementById('authModal');

  const openModal = type => {

    modal.classList.remove('hidden');

    document
      .querySelectorAll('.tab')
      .forEach(tab => {

        tab.classList.toggle(
          'active',
          tab.dataset.tab === type
        );
      });

    document
      .getElementById('loginForm')
      .classList.toggle(
        'hidden',
        type !== 'login'
      );

    document
      .getElementById('signupForm')
      .classList.toggle(
        'hidden',
        type !== 'signup'
      );
  };


  document
    .getElementById('loginOpen')
    .addEventListener(
      'click',
      () => openModal('login')
    );


  document
    .getElementById('openSignup')
    .addEventListener(
      'click',
      () => openModal('signup')
    );


  document
    .getElementById('modalClose')
    .addEventListener('click', () => {

      modal.classList.add('hidden');
    });


  document
    .querySelectorAll('.tab')
    .forEach(tab => {

      tab.addEventListener('click', () => {

        openModal(tab.dataset.tab);
      });
    });


  // -------------------------
  // SIGN UP DEMO
  // -------------------------

  document
    .getElementById('signupForm')
    .addEventListener('submit', event => {

      event.preventDefault();

      const name =
        document
          .getElementById('signupName')
          .value
          .trim();

      const email =
        document
          .getElementById('signupEmail')
          .value
          .trim();

      localStorage.setItem(
        'vionoraSession',
        JSON.stringify({
          name,
          email
        })
      );

      document
        .getElementById('dashUser')
        .textContent =
        name || 'Demo User';

      modal.classList.add('hidden');

      document
        .getElementById('dashboard')
        .scrollIntoView({
          behavior: 'smooth'
        });
    });


  // -------------------------
  // LOGIN DEMO
  // -------------------------

  document
    .getElementById('loginForm')
    .addEventListener('submit', event => {

      event.preventDefault();

      const email =
        document
          .getElementById('loginEmail')
          .value
          .trim();

      const name =
        email.split('@')[0] ||
        'Demo User';

      localStorage.setItem(
        'vionoraSession',
        JSON.stringify({
          name,
          email
        })
      );

      document
        .getElementById('dashUser')
        .textContent = name;

      modal.classList.add('hidden');

      document
        .getElementById('dashboard')
        .scrollIntoView({
          behavior: 'smooth'
        });
    });


  // -------------------------
  // LOGOUT
  // -------------------------

  document
    .getElementById('logoutBtn')
    .addEventListener('click', () => {

      localStorage.removeItem(
        'vionoraSession'
      );

      document
        .getElementById('dashUser')
        .textContent =
        'Demo User';
    });


  // INITIAL LOAD

  updateCart();

  renderOrders();

});
