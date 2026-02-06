const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
let sidebarOpen = true;

function toggleNav() {
    sidebar.classList.toggle("collapsed");
    if (sidebar.classList.contains("collapsed")) {
        main.style.marginLeft = "40px"; // collapsed sidebar
    } else {
        main.style.marginLeft = "200px"; // expanded sidebar
    }
    sidebarOpen = !sidebarOpen;
}


const sidebarLinks = document.querySelectorAll("#sidebar a");


function removeActive() { //Function that removes active from a link.
    sidebarLinks.forEach(link => link.classList.remove("active"));
}

// Handle click on links
sidebarLinks.forEach(link => {// Swaps the active class to whatever link is clicked.
    link.addEventListener("click", function() {
        removeActive();
        this.classList.add("active");
    });
});


window.addEventListener("scroll", () => { // Scoll event listener to swap active class that way
    const scrollPos = window.scrollY + 50; // adjusts for headers.

    sidebarLinks.forEach(link => {
        const section = document.querySelector(link.hash);
        if (!section) return;

        if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
            removeActive();
            link.classList.add("active");
        }
    });
});