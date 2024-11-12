let auth0 = null;

async function initAuth0() {
    auth0 = await createAuth0Client({
        domain: 'dev-argtrbvnnrexnrjr.us.auth0.com',
        client_id: 'ZYypebae9LOWnhemHWGvYniBwlXqwGLg',
        redirect_uri: window.location.href
    });

    
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
        try {
            
            await auth0.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname); 
        } catch (error) {
            console.error("Error en handleRedirectCallback:", error);
        }
    }
    
    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        const user = await auth0.getUser();
        document.getElementById("userInfo").innerHTML = `Bienvenido, ${user.name}`;
        document.getElementById("login").style.display = "none";
        document.getElementById("logout").style.display = "block";
        document.getElementById("agregarArticulo").style.display = "block"; 
        document.getElementById("openArticulo").style.display = "block";
    } else {
        document.getElementById("login").style.display = "block";
        document.getElementById("logout").style.display = "none";
        document.getElementById("agregarArticulo").style.display = "none";
        document.getElementById("openArticulo").style.display = "none";
    }
}

async function login() {
    await auth0.loginWithRedirect({
        redirectUri: window.location.href
    });
}

async function logout() {
    await auth0.logout({
        returnTo: 'https://juanjomartinez64.github.io/Calculador/'
    });
    window.location.href = 'https://juanjomartinez64.github.io/Calculador/';
}

async function isAuthenticated() {
    return await auth0.isAuthenticated();
}

async function getUser() {
    return await auth0.getUser();
}

window.onload = async () => {
    await initAuth0();
    
    const isLoggedIn = await isAuthenticated();
    if (isLoggedIn) {
        const user = await getUser();
        document.getElementById("userInfo").innerHTML = `Bienvenido, ${user.name}`;
        document.getElementById("login").style.display = "none";
        document.getElementById("logout").style.display = "block";
        document.getElementById("agregarArticulo").style.display = "block";  
    } else {
        document.getElementById("logout").style.display = "none";
        document.getElementById("login").style.display = "block";
        document.getElementById("agregarArticulo").style.display = "none";
    }
    
    main(); 
}; 