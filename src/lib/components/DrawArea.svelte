<div class="calculation-box">
    <p class="calculation-title">Area Specific Statistics</p>
    <div id="calculated-area" class="calculated-area">
        Draw your area of interest
    </div>
</div>

<style>
    .calculation-box {
        height: auto;
        width: 250px;
        position: absolute;
        bottom: 25%;
        left: 15%;
        background-color: white; /* Slightly more opaque white */
        padding: 20px;
        text-align: center;
        border-radius: 12px; /* Smooth rounded corners */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Softer shadow for depth */
        z-index: 2;
        transform: translate(-50%, 50%); /* Center it properly */
        backdrop-filter: blur(5px);
        font-family: "Sanrif";
    }

    .calculation-title {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
        font-family: "Sanrif";
    }

    .calculated-area {
        font-size: 1rem;
        color: #555; /* Slightly lighter text color for better contrast */
    }

    .calculation-box p {
        margin: 0;
    }
</style>
