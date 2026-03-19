let hamsterState = {
    hydration: 50,
    nutrition: 50,
    energy: 50,
    happiness: 50,
    streak: 0,
    lastActivityDate: null,
    lastTaskTimes: {},
    walkProgress: 0,
    petName: "Hammy"
};

// Quiz Questions Bank
const quizBank = [
    { q: "What is the scientific name of the European hamster?", a: ["Cricetus cricetus", "Mesocricetus auratus", "Cricetulus migratorius", "Phodopus sungorus"], correct: 0 },
    { q: "Why is the European hamster endangered in countries like Belgium?", a: ["Overhunting for fur", "Loss of habitat due to agriculture and urbanization", "Climate being too cold", "Competition with squirrels"], correct: 1 },
    { q: "What is a key characteristic of the European hamster compared to pet hamsters?", a: ["It is smaller and more social", "It lives only in trees", "It is larger and highly territorial", "It cannot hibernate"], correct: 2 },
    { q: "What does “endangered species” mean?", a: ["A species that is common worldwide", "A species that is at risk of extinction", "A species only found in zoos", "A species that migrates often"], correct: 1 },
    { q: "Which organization maintains the global “Red List” of threatened species?", a: ["WWF", "Greenpeace", "IUCN (International Union for Nature)", "UNESCO"], correct: 2 },
    { q: "Where does the European hamster naturally live?", a: ["Forest treetops", "Grasslands and farmland", "Deserts", "Arctic tundra"], correct: 1 },
    { q: "What special behavior helps European hamsters survive the winter?", a: ["Migration", "Hibernation", "Building nests in trees", "Growing thicker fur only"], correct: 1 },
    { q: "What is one reason modern farming affects hamster populations?", a: ["It increases food variety too much", "It removes hedgerows and natural shelter", "It creates more forests", "It introduces more predators"], correct: 1 },
    { q: "What does “biodiversity” refer to?", a: ["The number of zoos in a country", "The variety of life in an area", "Only endangered animals", "Only plant species"], correct: 1 },
    { q: "Which of these is another endangered animal in Europe?", a: ["Red fox", "European bison", "House mouse", "Rock pigeon"], correct: 1 },
    { q: "Why are small populations of animals more vulnerable?", a: ["They eat too much food", "They have less genetic diversity", "They grow faster", "They migrate more often"], correct: 1 },
    { q: "What role do European hamsters play in the ecosystem?", a: ["They pollinate flowers", "They help spread seeds and aerate soil", "They only eat insects", "They build dams"], correct: 1 },
    { q: "What is a conservation program?", a: ["A hunting strategy", "A plan to protect and restore species and habitats", "A zoo exhibition", "A farming method"], correct: 1 },
    { q: "Which human activity is a major threat to endangered species worldwide?", a: ["Recycling", "Urban expansion", "Planting trees", "Wildlife protection laws"], correct: 1 },
    { q: "What can individuals do to help protect endangered species?", a: ["Destroy habitats", "Support conservation efforts and sustainable products", "Keep wild animals as pets", "Ignore environmental issues"], correct: 1 }
];let quizSession = {
    questions: [],
    currentIndex: 0,
    score: 0,
    currentOptions: []
};
// Fun Facts & Tips Database
const funFacts = [
    "The European hamster (European hamster) can grow up to 30 cm long, much bigger than typical pet hamsters.",
    "It has cheek pouches that can stretch dramatically to carry food back to its burrow.",
    "In the wild, it can store several kilograms of food for winter!",
    "Despite being cute, it can be surprisingly aggressive and solitary.",
    "In Belgium, conservation programs try to protect farmland habitats where it lives.",
    "One major threat to many endangered species is habitat fragmentation, where roads and cities break up natural living spaces.",
    "The European hamster is now classified as “Critically Endangered” in many parts of its range—one step away from extinction in the wild.",
    "Unlike pet Syrian hamsters, they have striking black bellies, which is highly unusual for small mammals.",
    "They can store huge amounts of food in their cheek pouches—sometimes carrying back up to 3 kg to their burrows!"
];

const preservationTips = [
    "Support local wildlife foundations and farmer programs that use 'hamster-friendly' agricultural techniques.",
    "Avoid using harmful pesticides in your own garden to protect the insects they eat.",
    "Spread the word! Most people don't even know that wild hamsters exist in Europe today."
];

// --- Proactive Camera Permission Request ---
// Removed startup request to avoid locking the camera hardware before Streamlit can use it.


// Task Setup
let currentPendingTask = null;
let activeTaskInterval = null;
let decayInterval = null;
let verificationTimeout = null;
let isAnimationActive = false;
let currentIdleSrc = "normal-state-hamster.mp4";

const availableTasks = [
    // Weight probabilities by repeating elements 
    // High chance for hydration (4 items)
    { id: 'drink_water', label: '💧 Drink Water' },
    { id: 'drink_water', label: '💧 Drink Water' },
    { id: 'drink_water', label: '💧 Drink Water' },
    { id: 'drink_water', label: '💧 Drink Water' },
    // Medium chance for food/snacks (3 items)
    { id: 'eat_food', label: '🍎 Eat Snack' },
    { id: 'eat_food', label: '🍎 Eat Snack' },
    { id: 'eat_food', label: '🍎 Eat Snack' },
    // Low chance for happiness/walking (1 item each)
    { id: 'go_outside', label: '🌳 Go Outside' }
];

// Initialize and load from LocalStorage
function loadState() {
    const saved = localStorage.getItem('hamsterState');
    if (saved) {
        const parsed = JSON.parse(saved);
        hamsterState = { ...hamsterState, ...parsed };
        if (!hamsterState.lastTaskTimes) hamsterState.lastTaskTimes = {};
        checkNeglect();
    }
    updateUI();
    startGameLoops();
}

function checkNeglect() {
    if (!hamsterState.lastActivityDate) return;

    const last = new Date(hamsterState.lastActivityDate);
    const today = new Date();

    // Set both to midnight for pure day comparison
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        // Neglected for more than 1 day
        const penalty = (diffDays - 1) * 20; // 20 points per extra day missed
        hamsterState.hydration = Math.max(0, hamsterState.hydration - penalty);
        hamsterState.nutrition = Math.max(0, hamsterState.nutrition - penalty);
        hamsterState.happiness = Math.max(0, hamsterState.happiness - penalty);
        hamsterState.energy = Math.max(0, hamsterState.energy - penalty);

        // Reset streak for neglect
        hamsterState.streak = 0;

        // Show a message
        setTimeout(() => {
            alert(`😢 Oh no! Your hamster was neglected for ${diffDays} days. It missed you and its health has suffered!`);
        }, 1000);

        saveState();
    }
}

function startGameLoops() {
    // 1. Slow decay stats for normal gameplay (very small steps once a minute)
    decayInterval = setInterval(() => {
        hamsterState.hydration = Math.max(0, hamsterState.hydration - 1);
        hamsterState.nutrition = Math.max(0, hamsterState.nutrition - 1);
        // Energy slowly replenishes over time resting!
        hamsterState.energy = Math.min(100, hamsterState.energy + 1);
        hamsterState.happiness = Math.max(0, hamsterState.happiness - 0.5);

        // Happiness drops slightly faster if vitally low
        if (hamsterState.hydration === 0 || hamsterState.nutrition === 0) {
            hamsterState.happiness = Math.max(0, hamsterState.happiness - 1);
        }

        saveState();
        updateUI();
    }, 60000); // 60,000ms = 1 minute

    // 2. Spawn random tasks
    activeTaskInterval = setInterval(() => {
        const panel = document.getElementById('actions-panel');
        if (panel && panel.innerHTML.includes('Waiting')) {
            spawnTask();
        }
    }, 4000); // Check every 4s

    // Initial spawn
    setTimeout(spawnTask, 2000);
}

function spawnTask() {
    const panel = document.getElementById('actions-panel');
    const today = new Date().toDateString();

    // Filter out tasks that have already been done today
    const validTasks = availableTasks.filter(task => {
        const lastTime = hamsterState.lastTaskTimes[task.id];
        if (!lastTime) return true; // Never done
        const lastDate = new Date(lastTime).toDateString();
        return lastDate !== today;
    });

    // If everything is on daily cooldown
    if (validTasks.length === 0) {
        panel.innerHTML = `<div style="text-align: center; color: #868e96; grid-column: span 2; padding: 1rem;">Your hamster is all done for today! Check back tomorrow. 😴</div>`;
        return;
    }

    const randomTask = validTasks[Math.floor(Math.random() * validTasks.length)];

    panel.innerHTML = '';

    const btn = document.createElement('button');
    btn.className = 'action-btn popup-btn';
    btn.innerHTML = `⚠️ New Task!<br><strong>${randomTask.label}</strong><br><small>(Click to do it)</small>`;
    btn.onclick = () => openCameraTask(randomTask.id, randomTask.label);

    panel.appendChild(btn);
}

function clearTaskPanel() {
    const panel = document.getElementById('actions-panel');
    panel.innerHTML = `<div style="text-align: center; color: #868e96; grid-column: span 2; padding: 1rem;">Waiting for next task... ⏳</div>`;
}

// Save to LocalStorage
function saveState() {
    localStorage.setItem('hamsterState', JSON.stringify(hamsterState));
}

// Perform a task from UI click or camera verification
function performTask(taskName) {
    if (taskName === 'drink_water') {
        hamsterState.hydration = Math.min(100, hamsterState.hydration + 25);
        hamsterState.energy = Math.min(100, hamsterState.energy + 5);
        triggerAnimation('drinking-hamster.mp4', 5000, true);
    } else if (taskName === 'eat_food' || taskName === 'go_outside' || taskName === 'walk') {
        if (taskName === 'eat_food') {
            hamsterState.nutrition = Math.min(100, hamsterState.nutrition + 25);
            hamsterState.energy = Math.min(100, hamsterState.energy + 10);
        } else if (taskName === 'go_outside') {
            hamsterState.happiness = Math.min(100, hamsterState.happiness + 25);
            hamsterState.energy = Math.max(0, hamsterState.energy - 10);
        }
        triggerAnimation('finish-task-hamster.mp4', 5000);
    }

    // Passive Walk Progress logic
    if (typeof hamsterState.walkProgress === 'undefined') hamsterState.walkProgress = 0;
    if (hamsterState.walkProgress < 100) {
        hamsterState.walkProgress = Math.min(100, hamsterState.walkProgress + 25);
        if (hamsterState.walkProgress === 100) {
            hamsterState.happiness = Math.min(100, hamsterState.happiness + 20);
            triggerAnimation('finish-task-hamster.mp4', 5000);
            setTimeout(() => alert("🎉 Daily Walk Complete! +20 Happiness!"), 500);
        }
    }

    // General happiness bump for taking care of the pet
    hamsterState.happiness = Math.min(100, hamsterState.happiness + 5);

    // Record exactly when this task was completed for the 3-hour cooldown
    hamsterState.lastTaskTimes[taskName] = Date.now();

    // Streak logic (Add streak only once per real-world day)
    const today = new Date().toDateString();
    if (hamsterState.lastActivityDate !== today) {
        hamsterState.streak++;
        hamsterState.lastActivityDate = today;
    }

    saveState();
    updateUI();
}

function triggerAnimation(videoSrc, duration, playSound = false) {
    const video = document.getElementById('hamster-video');
    const audio = document.getElementById('audio-drinking');

    if (video) {
        isAnimationActive = true;
        const previousSrc = video.src; // Keep track if we need to revert to a specific idle

        video.src = videoSrc;
        video.loop = false; // Task completion videos usually aren't loops
        video.load(); // Ensure the new source is loaded
        video.play();

        if (playSound && audio) {
            audio.play().catch(e => console.log("Audio playback delayed until user interaction."));
        }

        setTimeout(() => {
            isAnimationActive = false;
            video.src = currentIdleSrc; // Revert to whatever idle is current (Sad or Normal)
            video.loop = true;
            video.play();
        }, duration);
    }
}

// Determine if the hamster is Super, Sad, or Normal
function getVisualState() {
    const avg = (hamsterState.hydration + hamsterState.nutrition + hamsterState.energy + hamsterState.happiness) / 4;

    // If any stat is critically low
    const isCriticallyLow = ['hydration', 'nutrition', 'energy', 'happiness'].some(key => hamsterState[key] <= 20);

    if (avg >= 85 && !isCriticallyLow) return 'Super';
    if (isCriticallyLow || avg < 40) return 'Sad';
    return 'Normal';
}

// Update the user interface
function updateUI() {
    // 1. Update progress bars
    document.getElementById('bar-hydration').style.width = `${hamsterState.hydration}%`;
    document.getElementById('bar-nutrition').style.width = `${hamsterState.nutrition}%`;
    document.getElementById('bar-energy').style.width = `${hamsterState.energy}%`;
    document.getElementById('bar-happiness').style.width = `${hamsterState.happiness}%`;

    // 2. Update streak
    document.getElementById('streak-count').innerText = hamsterState.streak;

    // Determine current IDLE source based on state
    const visualState = getVisualState();
    const newIdle = (visualState === 'Sad') ? 'sad-state-hamster.mp4' : 'normal-state-hamster.mp4';

    // Update idle source if it changed
    if (currentIdleSrc !== newIdle) {
        currentIdleSrc = newIdle;
        // If no animation is currently overriding the video, update the video src immediately
        const video = document.getElementById('hamster-video');
        if (video && !isAnimationActive) {
            video.src = currentIdleSrc;
            video.loop = true;
            video.load();
            video.play();
        }
    }

    // 3. Update visuals and animations (status text etc)
    // If an animation is active, we skip changing the video but still update status text
    const petContainer = document.getElementById('pet-container');
    const petStatusText = document.getElementById('pet-status-text');
    const hamsterIcon = document.getElementById('hamster');

    // Reset container classes
    petContainer.className = 'pet-display';

    if (visualState === 'Super') {
        petContainer.classList.add('state-super');
        petStatusText.innerText = 'Super Healthy!';
        if (hamsterIcon) hamsterIcon.innerText = '🐹✨';
        showRewards(true);
    } else if (visualState === 'Sad') {
        petContainer.classList.add('state-sad');
        petStatusText.innerText = 'Weak & Sad...';
        if (hamsterIcon) hamsterIcon.innerText = '🐹💧';
        showRewards(false);
    } else {
        petContainer.classList.add('state-normal');
        petStatusText.innerText = 'Happy';
        if (hamsterIcon) hamsterIcon.innerText = '🐹';
        showRewards(false);
    }

    // Bar color warnings (turn red if low)
    updateBarColors();

    // Update Walk Progress Bar
    const walkBar = document.getElementById('bar-walk');
    if (walkBar) {
        walkBar.style.width = `${hamsterState.walkProgress || 0}%`;
        if (hamsterState.walkProgress >= 100) {
            walkBar.style.backgroundColor = '#fcc419'; // Gold when done
        } else {
            walkBar.style.backgroundColor = '#20c997'; // Green normally
        }
    }

    // Update Pet Name
    document.getElementById('pet-name-display').innerText = hamsterState.petName || "Hammy";
}

function updateBarColors() {
    const colorMap = {
        'bar-hydration': { val: hamsterState.hydration, defaultClass: 'water' },
        'bar-nutrition': { val: hamsterState.nutrition, defaultClass: 'food' },
        'bar-energy': { val: hamsterState.energy, defaultClass: 'energy' },
        'bar-happiness': { val: hamsterState.happiness, defaultClass: 'happy' }
    };

    for (const [id, data] of Object.entries(colorMap)) {
        const el = document.getElementById(id);
        if (data.val <= 20) {
            el.style.backgroundColor = '#fa5252'; // Danger red
        } else {
            el.style.backgroundColor = ''; // Reverts to CSS class default
        }
    }
}

// Show/Hide rewards panel
function showRewards(show) {
    const panel = document.getElementById('rewards-panel');
    if (show) {
        // If it's already visible, don't change the text to avoid flickering
        if (panel.classList.contains('hidden')) {
            const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
            const randomTip = preservationTips[Math.floor(Math.random() * preservationTips.length)];

            document.getElementById('fact-text').innerText = randomFact;
            document.getElementById('tip-text').innerText = randomTip;

            panel.classList.remove('hidden');
        }
    } else {
        panel.classList.add('hidden');
    }
}

// --- Streamlit Verification Mock Logic ---

function openCameraTask(taskId, taskLabel) {
    currentPendingTask = taskId;
    document.getElementById('camera-modal').classList.remove('hidden');
    document.body.classList.add('no-scroll');
    
    // Inject the Streamlit Iframe
    const container = document.getElementById('camera-iframe-container');
    // Note: This assumes you run: py -3.11 -m streamlit run machine.py
    const streamlitUrl = `https://wild-life-guardian.streamlit.app/?task=${taskId}&label=${encodeURIComponent(taskLabel)}`;
    
    container.innerHTML = `<iframe src="${streamlitUrl}" style="width:100%; height:100%; border:none;" allow="camera; microphone"></iframe>`;

    // Reset UI and start 20s timeout timer
    const statusDiv = document.getElementById('verification-status');
    statusDiv.className = 'status-banner hidden';
    statusDiv.innerText = '';

    if (verificationTimeout) clearTimeout(verificationTimeout);
    
    verificationTimeout = setTimeout(() => {
        if (!statusDiv.innerText.includes("APPROVED")) {
            statusDiv.innerText = "❌ ERROR: Verification Timed Out (20s). Please check your internet or restart the camera.";
            statusDiv.className = "status-banner status-timeout";
            console.error("AI Verification Timed Out after 20 seconds.");
        }
    }, 20000); // 20 Seconds
}

function closeCameraModal() {
    document.getElementById('camera-modal').classList.add('hidden');
    document.body.classList.remove('no-scroll');
    currentPendingTask = null;
}

// Listen for messages from the Streamlit iframe (AI Verification)
window.addEventListener('message', (event) => {
    // SECURITY NOTE: In production, you should check event.origin here!
    console.log("DEBUG: Website received message:", event.data);

    if (!event.data) return;

    // Handle Handshake (confirming AI is alive and connected)
    if (event.data.type === 'handshake') {
        console.log("AI Handshake successful! Connection verified.");
        const statusDiv = document.getElementById('verification-status');
        if (statusDiv) {
            statusDiv.innerText = "✨ AI Ready & Connected";
            statusDiv.className = "status-banner status-ready";
            // Auto hide after 3 seconds
            setTimeout(() => { if (statusDiv.innerText === "✨ AI Ready & Connected") statusDiv.className = "status-banner hidden"; }, 3000);
        }
        return;
    }
    
    if (event.data.type === 'taskComplete' || event.data.type === 'taskResult') {
        // Clear timeout as we received a response!
        if (verificationTimeout) clearTimeout(verificationTimeout);
        
        const taskName = event.data.task;
        const isApproved = event.data.type === 'taskComplete' || event.data.approved === true;
        const statusDiv = document.getElementById('verification-status');

        if (isApproved) {
            statusDiv.innerText = "✅ APPROVED! Updating hamster...";
            statusDiv.className = "status-banner status-approved";
            
            // Perform the game reward
            performTask(taskName);
            clearTaskPanel();

            // Wait 2.5s then close
            setTimeout(() => {
                closeCameraModal();
            }, 2500);
        } else {
            statusDiv.innerText = "❌ DECLINED! Make sure the object is clear.";
            statusDiv.className = "status-banner status-declined";
            
            // Auto-hide the "Declined" message after 3 seconds so they can see again
            setTimeout(() => {
                if (statusDiv.className.includes('status-declined')) {
                    statusDiv.className = "status-banner hidden";
                }
            }, 3000);
        }
    }
});

// Start app
window.onload = loadState;

// --- Testing & Debugging ---
function resetTestingValues() {
    if (confirm("Reset all game data? (Testing only)")) {
        localStorage.removeItem('hamsterState');
        hamsterState = {
            hydration: 50,
            nutrition: 50,
            energy: 50,
            happiness: 50,
            streak: 0,
            lastActivityDate: null,
            lastTaskTimes: {},
            walkProgress: 0,
            petName: "Hammy"
        };
        saveState();
        updateUI();
        clearTaskPanel();
        alert("Data reset successfully!");
    }
}

// --- Pet Naming ---
function changePetName() {
    const newName = prompt("What should your European Hamster's name be?", hamsterState.petName);
    if (newName && newName.trim().length > 0) {
        hamsterState.petName = newName.trim().substring(0, 15);
        saveState();
        updateUI();
    }
}

// --- Quiz Logic ---
function openQuizModal() {
    document.getElementById('quiz-modal').classList.remove('hidden');
    document.getElementById('quiz-start-view').classList.remove('hidden');
    document.getElementById('quiz-question-view').classList.add('hidden');
    document.getElementById('quiz-results-view').classList.add('hidden');
    document.body.classList.add('no-scroll');
}

function closeQuizModal() {
    document.getElementById('quiz-modal').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

// --- Info / Awareness Modal ---
function openInfoModal() {
    document.getElementById('info-modal').classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

function closeInfoModal() {
    document.getElementById('info-modal').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

function startQuiz() {
    // Pick 5 random questions
    const shuffled = [...quizBank].sort(() => 0.5 - Math.random());
    quizSession.questions = shuffled.slice(0, 5);
    quizSession.currentIndex = 0;
    quizSession.score = 0;

    document.getElementById('quiz-start-view').classList.add('hidden');
    document.getElementById('quiz-question-view').classList.remove('hidden');
    showQuizQuestion();
}

function showQuizQuestion() {
    const qData = quizSession.questions[quizSession.currentIndex];
    document.getElementById('quiz-question-text').innerText = `Question ${quizSession.currentIndex + 1}/5: ${qData.q}`;

    const container = document.getElementById('quiz-options-container');
    container.innerHTML = '';

    // Create a list of options with their "correct" state
    const options = qData.a.map((text, index) => ({
        text: text,
        isCorrect: (index === qData.correct)
    }));

    // Shuffle them
    quizSession.currentOptions = options.sort(() => 0.5 - Math.random());

    quizSession.currentOptions.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => handleQuizAnswer(index);
        container.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex) {
    const qData = quizSession.questions[quizSession.currentIndex];
    const buttons = document.querySelectorAll('.option-btn');
    const options = quizSession.currentOptions;

    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    if (options[selectedIndex].isCorrect) {
        buttons[selectedIndex].classList.add('correct');
        quizSession.score++;
    } else {
        buttons[selectedIndex].classList.add('wrong');
        // Find and highlight correct answer
        options.forEach((opt, idx) => {
            if (opt.isCorrect) buttons[idx].classList.add('correct');
        });
    }

    setTimeout(() => {
        quizSession.currentIndex++;
        if (quizSession.currentIndex < 5) {
            showQuizQuestion();
        } else {
            finishQuiz();
        }
    }, 1500);
}

function finishQuiz() {
    document.getElementById('quiz-question-view').classList.add('hidden');
    document.getElementById('quiz-results-view').classList.remove('hidden');

    const scoreText = `You got ${quizSession.score}/5 correct!`;
    document.getElementById('quiz-score-text').innerText = scoreText;

    // Give rewards or penalties
    if (quizSession.score <= 1) {
        // Lose energy and happiness
        hamsterState.happiness = Math.max(0, hamsterState.happiness - 15);
        hamsterState.energy = Math.max(0, hamsterState.energy - 10);
        document.getElementById('quiz-reward-text').innerText = "Oh no! Your hamster is confused and tired (-15 Happiness, -10 Energy)";
    } else {
        // Gain a bit of everything
        hamsterState.hydration = Math.min(100, (hamsterState.hydration || 0) + 10);
        hamsterState.nutrition = Math.min(100, (hamsterState.nutrition || 0) + 10);
        hamsterState.happiness = Math.min(100, (hamsterState.happiness || 0) + 10);
        hamsterState.energy = Math.min(100, (hamsterState.energy || 0) + 10);
        document.getElementById('quiz-reward-text').innerText = "Well done! Your hamster feels great and learned a lot! (+10 to all stats)";
    }

    saveState();
    updateUI();
}
