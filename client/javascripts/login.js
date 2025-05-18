document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;
  
    const res = await fetch("/access/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });
  
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/html/admin.html";
    } else {
      document.getElementById("message").textContent = data.message;
    }
  });
  