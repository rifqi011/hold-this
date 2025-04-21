// Particles.js configuration and initialization
document.addEventListener("DOMContentLoaded", function () {
	// Particles configuration
	const particlesConfig = {
		particles: {
			number: {
				value: 100,
				density: {
					enable: true,
					value_area: 800,
				},
			},
			color: {
				value: "#000000",
			},
			shape: {
				type: "circle",
				stroke: {
					width: 0,
				},
			},
			opacity: {
				value: 1,
				random: true,
				anim: {
					enable: true,
					speed: 0.5,
					opacity_min: 0.1,
					sync: false,
				},
			},
			size: {
				value: 8,
				random: true,
				anim: {
					enable: true,
					speed: 5,
					size_min: 0.1,
					sync: false,
				},
			},
			line_linked: {
				enable: true,
				distance: 150,
				color: "#000",
				opacity: 0.4,
				width: 1,
			},
			move: {
				enable: true,
				speed: 2,
				direction: "none",
				random: true,
				straight: false,
				out_mode: "out",
				bounce: false,
				attract: {
					enable: false,
					rotateX: 600,
					rotateY: 1200,
				},
			},
		},
		interactivity: {
			detect_on: "canvas",
			events: {
				onhover: {
					enable: false,
					mode: "repulse",
				},
				onclick: {
					enable: false,
					mode: "push",
				},
				resize: true,
			},
		},
		retina_detect: true,
	}

	// Initialize particles.js
	if (window.particlesJS) {
		window.particlesJS("particles-js", particlesConfig)
	}
})
