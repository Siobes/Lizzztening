let currentSound = null;
let noiseCounter = 0; // Counter for noise above 10%
let noiseInterval = null; // Interval to track noise over time
let micActive = false; // Flag to indicate if the microphone is active
let recommendationText = document.getElementById("recommendationText");

document.getElementById("splash").style.display = "block";
document.getElementById("mainMenu").style.display = "none";
document.getElementById("playerMenu").style.display = "none";
document.getElementById("playingScreen").style.display = "none";
document.getElementById("sleepScreen").style.display = "none";
document.getElementById("sleepReport").style.display = "none"; // Initially hide the report

// Splash screen tap to continue
document.getElementById("tap-to-continue").addEventListener("click", function () {
    document.getElementById("splash").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
});

// Main menu image options
document.getElementById("playerOption").addEventListener("click", function () {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("playerMenu").style.display = "block";
});

document.getElementById("sleepOption").addEventListener("click", function () {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("sleepScreen").style.display = "block";
    startNoiseDetection(); // Start listening to microphone
});

// Stop sleep button action (immediate return to the main menu)
document.getElementById("stopSleepButton").addEventListener("click", function () {
    stopNoiseDetection();
    
    // Hide the sleep screen and immediately show the main menu
    document.getElementById("sleepScreen").style.display = "none"; // Hide sleep screen
    document.getElementById("mainMenu").style.display = "block"; // Show the main menu
    
    // If you want to show the sleep report briefly and go back to the main menu, uncomment this section:
    // document.getElementById("sleepReport").style.display = "block"; // Show report section (optional)
    // document.getElementById("reportText").textContent = generateReport(); // Generate report text
    // setTimeout(function () {
    //     document.getElementById("sleepReport").style.display = "none"; // Hide report after delay
    //     document.getElementById("mainMenu").style.display = "block"; // Show main menu
    // }, 3000); // Adjust this timeout as needed
});

// Back Button for Sleep Mode (After viewing report)
document.getElementById("backToMainMenuFromSleep").addEventListener("click", function () {
    document.getElementById("sleepReport").style.display = "none"; // Hide the report
    document.getElementById("mainMenu").style.display = "block"; // Show the main menu again
});

// Player button: Play sounds (sea wave, rain, wind)
document.getElementById("seaWaveButton").addEventListener("click", function () {
    playSound('sea_wave');
});
document.getElementById("rainButton").addEventListener("click", function () {
    playSound('rain');
});
document.getElementById("windButton").addEventListener("click", function () {
    playSound('wind');
});
document.getElementById("WhiteNoiseButton").addEventListener("click", function () {
    playSound('whitenoise');
});
document.getElementById("WhiteNoise2Button").addEventListener("click", function () {
    playSound('whitenoise2');
});

// Back Button for Player Menu
document.getElementById("backButton").addEventListener("click", function () {
    document.getElementById("playerMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
});

// Stop sound and show back button
document.getElementById("stopButton").addEventListener("click", function () {
    stopSound();
});

// Function to play sound
function playSound(soundType) {
    const soundMap = {
        'sea_wave': 'Sea Waves.mp3',
        'rain': 'Rain.mp3',
        'wind': 'Wind.mp3',
        'whitenoise': 'whitenoise.mp3',
        'whitenoise2' : 'whitenoise2.mp3'
    };

    // Stop the previous sound if it's playing
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0; // Reset the sound to the beginning
    }

    // Instantiate the new audio object
    currentSound = new Audio(soundMap[soundType]);
    currentSound.play();

    document.getElementById("playingText").innerText = `${soundType.charAt(0).toUpperCase() + soundType.slice(1)} is playing`;
    document.getElementById("playingScreen").style.display = "block";
    document.getElementById("playerMenu").style.display = "none";
}

// Stop the sound
function stopSound() {
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0; // Reset to the beginning
    }
    document.getElementById("playingScreen").style.display = "none";
    document.getElementById("playerMenu").style.display = "block";
}

// Function for noise detection (Sleep mode)
function startNoiseDetection() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            micActive = true;
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();
            let analyser = audioContext.createAnalyser();
            let source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            let bufferLength = analyser.frequencyBinCount;
            let dataArray = new Uint8Array(bufferLength);

            noiseInterval = setInterval(function () {
                analyser.getByteFrequencyData(dataArray);
                let total = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    total += dataArray[i];
                }
                let average = total / dataArray.length;
                let volume = average / 2; // Calculate volume level
                document.getElementById("volumeValue").textContent = volume.toFixed(0);

                // Update the volume gauge
                document.getElementById("volumeGauge").value = volume;

                // Track noise above 10%
                if (volume > 10) {
                    noiseCounter++;
                    document.getElementById("noiseTime").textContent = noiseCounter;
                }

                // Update recommendations based on the noise counter
                if (noiseCounter > 30) {
                    recommendationText.textContent = "RECOMMENDATION 3: You need to sleep better.";
                } else if (noiseCounter > 20) {
                    recommendationText.textContent = "RECOMMENDATION 2: Your sleep could be disturbed.";
                } else if (noiseCounter > 10) {
                    recommendationText.textContent = "RECOMMENDATION 1: Try to reduce noise for better sleep.";
                } else {
                    recommendationText.textContent = "You sleep well last night.";
                }
            }, 1000); // Update every second
        });
    }
}

function stopNoiseDetection() {
    micActive = false;
    clearInterval(noiseInterval);
    noiseCounter = 0;
    document.getElementById("noiseTime").textContent = "0";
    recommendationText.textContent = "";
}

// Function to generate a report based on the noise detection time (optional)
function generateReport() {
    if (noiseCounter > 30) {
        return "RECOMMENDATION 3: Your sleep is heavily disturbed by noise.";
    } else if (noiseCounter > 20) {
        return "RECOMMENDATION 2: Your sleep could be disturbed.";
    } else if (noiseCounter > 10) {
        return "RECOMMENDATION 1: You should reduce noise for better sleep.";
    } else {
        return "You sleep well last night.";
    }
}
