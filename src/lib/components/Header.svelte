<script>
    import { fade, slide } from "svelte/transition";
    export let title = "Dynamic Map Explorer";
</script>

<header
    class="header"
    in:fade={{ duration: 3000 }}
    out:fade={{ duration: 300 }}
>
    <h1 class="animated-title">{title}</h1>
    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/map">Maps</a></li>
            <li><a href="/others">Sanky</a></li>
        </ul>
    </nav>
</header>

<style>
    h1 {
        font-family: 10px;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #64748b; /* Red background */
        color: white;
        padding: 1rem 2rem;
        width: 90%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 100;
        margin: 1rem;
    }

    .animated-title {
        font-size: 2rem;
        font-weight: 700;
        animation: glow 1.5s ease-in-out infinite alternate;
    }

    @keyframes glow {
        0% {
            text-shadow:
                0 0 10px rgba(255, 255, 255, 0.7),
                0 0 20px rgba(255, 255, 255, 0.5);
        }
        100% {
            text-shadow:
                0 0 20px rgba(255, 255, 255, 1),
                0 0 30px rgba(255, 255, 255, 0.8);
        }
    }

    nav ul {
        list-style-type: none;
        display: flex;
        gap: 2rem;
    }

    nav ul li a {
        color: white;
        text-decoration: none;
        font-size: 1.1rem;
        font-weight: 500;
        position: relative;
    }

    nav ul li a:hover::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 3px;
        background-color: #fca311;
        bottom: -5px;
        left: 0;
        border-radius: 5px;
        transition: width 0.3s ease-in-out;
    }

    nav ul li a:hover {
        color: #fca311;
    }

    nav ul li a::after {
        content: "";
        position: absolute;
        width: 0;
        height: 3px;
        background-color: #fca311;
        bottom: -5px;
        left: 0;
        transition: width 0.3s ease-in-out;
        border-radius: 5px;
    }
</style>
