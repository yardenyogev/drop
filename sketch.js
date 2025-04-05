// P5.js + Matter.js Plinko Game: "DROP" - v0.71 (Update: Refined Survival desc highlight)

// <<< Ensure p5.sound.min.js is included in your HTML file >>>
// <<< Ensure Supabase client is initialized in HTML and globally accessible via window.supabaseClient >>>
// <<< Ensure Supabase RLS allows INSERT and SELECT for 'anon' role on both leaderboard tables >>>
// <<< Ensure your HTML form's submission script calls handleScoreSubmittedSuccessfully() on success >>>

// Module aliases
let Engine = Matter.Engine,
    World = Matter.World, Bodies = Matter.Bodies, Body = Matter.Body,
    Events = Matter.Events, Composite = Matter.Composite, Common = Matter.Common;

// Physics
let engine, world;
let engineInitialized = false; // Flag for physics readiness

// Game Elements & State
let pegs = [], balls = [], slotSensors = [], dividers = [], boundaries = [];
let lastRowPegPositionsX = []; let topRowOuterPegsX = [];
let slotHitCounts = []; let histogramBarPulseState = []; let slotBounceState = []; let slotGlowState = [];
let activeParticles = []; let activeRipples = [];
let backgroundRipples = [];
let starfield = []; let shootingStars = [];
const targetWidth = 1000; const targetHeight = 850;
const baseCanvasWidth = 1000; const baseCanvasHeight = 850; const baseGameAreaWidth = 800; const baseMenuWidth = 200;
const DEBUG_MODE = false; // Set to true for detailed console logs
const numSlots = 17;
const slotMultipliers = [25, 6, 3, 2, 1, 0.7, 0.5, 0.3, 0.2, 0.3, 0.5, 0.7, 1, 2, 3, 6, 25];
const basePegRadius = 4; const pegRowsTotal = 16; const baseStartYPegs = 110; const basePegSpacing = 45; const baseBallRadius = 7; const baseSlotHeight = 40; const baseDividerWidth = 2; const basePegSlotGap = 2;
const funnelColor = [200, 200, 220, 150]; const bounceDuration = 15; const baseBounceAmplitude = 7;
const initialScoreSurvival = 100; const highScoreBallsTotal = 20; const highScoreBallCost = 10;
const highScoreStartingGold = highScoreBallsTotal * highScoreBallCost;
const minBetAmount = 10;
const maxBetAmount = 10000;
const baseTitleY = 30; const baseTitleSize = 32; const baseUISideMargin = 15;
const baseUIScoreTextSize = 13;
const baseButtonTextSize = 9; const baseButtonWidth = 160; const baseButtonHeight = 40; const baseSlotTextSize = 8; const baseScoreY = 55; const baseMultiplierPanelTextSize = 14; const baseOddsDisplayTextSize = 7.5;
const baseCreatorTextSize = 12;
const baseSliderWidth = 150; const baseSliderHandleSize = 14; const baseSliderOriginSpacing = 85;
const baseDropButtonY = 105;

const neonBlue = [0, 191, 255]; const neonRed = [255, 20, 147]; const neonGreen = [57, 255, 20]; const neonYellow = [255, 255, 0]; const bonusColor = [0, 255, 127]; const trueRed = [255, 0, 0]; const brightRed = [255, 60, 60]; const greyishPurpleBase = [160, 120, 200]; const greyishPurpleHighlight = [210, 180, 255]; const softRed = [255, 90, 90]; const multiplierDisplayOrange = [255, 140, 0]; const markerColor = [255, 255, 255, 200]; const titleColorBase = [200, 200, 220]; const titleColorHighlight = [255, 255, 255]; const titleColorShadow = [50, 50, 80]; const menuButtonGradient = ['#d0b0ff', '#a080cc']; const menuButtonHoverGlow = 'rgba(220, 180, 255, 0.7)'; const gameOverButtonColor = [190, 130, 255]; const uiTextOutlineColor = [20, 15, 40, 200]; const uiTextGlowColor = [200, 180, 255, 100]; const clockHandColor = [255, 90, 90, 220];
const defaultActualGravity = 0.6; const minActualGravity = 0.1; const maxActualGravity = 1.5; const minSpeedSliderDisplayValue = 0.2; const defaultSpeedSliderDisplay = 1.0; const maxSpeedSliderDisplayValue = 3.0; const minDropAmount = 1; const maxDropAmount = 100; const minBallRadius = 3; const maxBallRadius = 15; const basePegShadowBlur = 5;
const pegRestitution = 0.35; const pegFriction = 0.3; const ballRestitution = 0.6; const ballFrictionAir = 0.008; const ballDensity = 0.001; const groundRestitution = 0.05; const groundFriction = 0.6; const dividerRestitution = 0.1; const dividerFriction = 0.5; const horizontalKickStrength = 0.0018;
const bonusBallDuration = 180; // Frames the "NEXT DROP DOUBLED!" message is shown
const bonusBallChance = 0.01; // Chance to get the *next* drop doubled (Survival)
const doubleDropDuration = 30 * 60; // Frames Double Drop power-up lasts
const doubleDropChance = 0.001; // Base chance to trigger Double Drop (Survival)
const doubleMultiplierDuration = 30 * 60; // Frames 2x Multiplier power-up lasts
const doubleMultiplierChance = 0.0005; // Base chance to trigger 2x Multiplier (Survival)
const powerupBetScalingFactor = 1.5; // How much higher bets increase power-up chance
const dropDelay = 100; // Milliseconds delay for secondary balls (Double Drop, Bonus)
const maxTrailLength = 25; const trailStartAlpha = 130; const trailEndAlpha = 0; const trailStartWeightFactor = 0.35; const trailEndWeightFactor = 0.05; const powerupMessageDuration = 90; // Frames power-up trigger messages are shown
const pegGlowDuration = 12; const basePegGlowSizeIncrease = 1.5;
const baseMultiplierPanelLeftMargin = 10; const baseMultiplierPanelWidth = 70; const baseMultiplierPanelHeight = 300;
const baseMultiplierPanelTopMargin = 180;
const baseMultiplierPanelItemHeight = 30; const baseMultiplierPanelItemSpacing = 4; const baseMultiplierPanelBorderRadius = 4; const multiplierDisplayDuration = 180; const maxMultiplierHistory = 8;
const histogramPulseDuration = 15; const basePowerupTimerXOffset = 25; const basePowerupTimerYOffset = 15; const baseTimerTextSize = 22; const powerupTimerFlickerColors = [neonBlue, neonRed, neonGreen, neonYellow, bonusColor, [255, 255, 255]];
const baseOddsDisplayYOffsetFromTrack = 35; const baseOddsLineSpacing = 8; const creatorTextLine1 = "Created By:"; const creatorTextLine2 = "Yarden Yogev";
const creatorLineSpacing = 8;
const versionTextBottomMargin = 15;
const launchMenuCreatorTextBottomMargin = 35;
const settingsCreatorVersionPadding = 15;

const slotGlowDuration = 20; const slotGlowMaxAlpha = 180; const slotGlowColor = [255, 255, 255]; const particleCount = 18; const particleLifespan = 30; const particleBaseSpeed = 2.5; const particleColor = [255, 255, 220]; const rippleLifespan = 25; const rippleMaxRadiusFactor = 0.7; const rippleInitialAlpha = 150; const rippleColor = [255, 255, 255]; const rippleStartStrokeWeight = 3; const rippleEndStrokeWeight = 0.5;
const defaultSfxVolume = 0.7;
const defaultMusicVolume = 0.7;
const baseMarkerSpeed = 2.5; const baseMarkerSize = 10;
const survivalDecayStartDelay = 30000; // 30 seconds
const survivalDecayInterval = 30000; // 30 seconds
const survivalInitialDecayPercent = 0.10; const survivalDecayIncrement = 0.10;
const survivalMaxDecayPercent = 1.0;
const pointsLossWarningStartTime = 5; // Seconds before loss to show countdown
const pointsLossFlashDurationFrames = 15; // Frames the gold text flashes red on loss
const lossCountdownTextSizeBase = 65; const lossCountdownPulseScale = 1.15;
const lossMessageTextSizeBase = 100; const lossMessageStartScale = 1.5; const lossMessageDuration = 90; const lossMessageGlowBlur = 15;
const menuFadeInSpeed = 5; const parallaxLayersCount = 3; const parallaxPegsPerLayer = 50; const parallaxMaxOffsetFactor = 0.05; const menuParticleCount = 40; const menuParticleBaseSpeed = 0.5; const menuParticleLifespan = 250; const menuFallingBallCount = 25; const menuBackgroundBallGravity = 0.03; const menuBackgroundBallSpeedMin = 0.5; const menuBackgroundBallSpeedMax = 1.8; const menuButtonHoverScale = 1.06; const launchMenuSpacingBelowTitle = 30;
const gameOverButtonWidthScale = 1.3; const gameOverButtonHeightScale = 1.3; const gameOverButtonSpacing = 20; const numStars = 400; const starfieldSpeedFactor = 0.15; const gameOverSpeedMultiplier = 2.0; const starHueShiftSpeed = 0.05; const shootingStarChance = 0.008; const shootingStarSpeedMin = 4; const shootingStarSpeedMax = 8; const shootingStarLength = 50; const shootingStarColor = [220, 220, 255]; const baseStarParallaxFactor = 0.5;
const transitionDuration = 30; const FIXED_DELTA_TIME = 1000 / 60;
const DROP_GAME_VERSION = "V0.71"; // <<< VERSION number incremented >>>

// Background Ripple Effect Constants
const backgroundRippleLifespan = 40;
const backgroundRippleMaxRadiusFactor = 6;
const backgroundRippleInitialAlpha = 90;
const backgroundRippleColor = [80, 60, 100];
const backgroundRippleStartWeight = 1.5;
const backgroundRippleEndWeight = 0.2;

// Leaderboard Constants
const leaderboardMaxEntries = 10;
const baseLeaderboardTextSize = 14;
const baseLeaderboardTitleSize = 28;
const baseLeaderboardYOffset = 80;
const baseLeaderboardEntrySpacing = 5;

// Admin Constants
const ADMIN_ADD_GOLD_AMOUNT = 1000;

// Menu Hover Description Constants
const HOVER_BOX_BASE_WIDTH = 330;
const HOVER_BOX_BASE_PADDING = 16;
const HOVER_BOX_BASE_TEXT_SIZE = 16;
const HOVER_BOX_OFFSET_X = 15;
const HOVER_BOX_BG_COLOR = [35, 30, 55];
const HOVER_BOX_BORDER_COLOR = [150, 150, 180];
const HOVER_BOX_TEXT_COLOR = [220, 220, 240];
const HOVER_ANIM_DURATION = 15;
const NEON_GLOW_MAX_BLUR = 10;
const NEON_GLOW_COLOR_ALPHA = 150;
const SLIDE_OFFSCREEN_MARGIN = 20;
const HOVER_ANIM_ICON_BASE_SIZE = 14;
const HOVER_ANIM_SPACING = 8;
const HOVER_SUB_BULLET_EXTRA_INDENT = 25;

// --- Hover Leaderboard Constants ---
const HOVER_LEADERBOARD_BASE_WIDTH = 250;
const HOVER_LEADERBOARD_BASE_PADDING = 12;
const HOVER_LEADERBOARD_TITLE_SIZE_BASE = 18;
const HOVER_LEADERBOARD_TEXT_SIZE_BASE = 11;
const HOVER_LEADERBOARD_ENTRY_SPACING_BASE = 4;
const HOVER_LEADERBOARD_MAX_ENTRIES = 10;
const HOVER_LEADERBOARD_OFFSET_X = 15;
const HOVER_LEADERBOARD_BG_COLOR = [40, 35, 65];
const HOVER_LEADERBOARD_BORDER_COLOR = [160, 140, 190];
const HOVER_LEADERBOARD_TEXT_COLOR = [210, 210, 230];
const HOVER_LEADERBOARD_GOLD_COLOR_LIGHT = [255, 235, 100];
const HOVER_LEADERBOARD_GOLD_COLOR_MEDIUM = [255, 215, 0];
const HOVER_LEADERBOARD_GOLD_COLOR_STRONG = [255, 190, 0];
const HOVER_LEADERBOARD_SLIDE_DURATION = HOVER_ANIM_DURATION;


// --- Mode Descriptions ---
const survivalDescriptionText = `Survival Mode:

Goal: Earn points & climb the global leaderboard.
Start: Begin with ${initialScoreSurvival} gold.
Bet: Use the "bet amount" slider to choose your gold bet per ball.
Reward: Higher bets can yield more gold and points.
Scoring: Earn gold and points equal to your bet multiplied by the bin's multiplier when a ball lands in a bin.
Danger: Lose gold every ${survivalDecayInterval / 1000} seconds! (Starts at ${survivalInitialDecayPercent * 100}%, increases by ${survivalDecayIncrement * 100}% each time).
End: Game over when gold runs out or decay reaches 100%.
Race against time!
Random Power Ups Chances :
 Double Drop: Drop 2 balls instead of 1 for ${doubleDropDuration / 60}s.
 2x Multiplier: All bin multipliers are doubled for ${doubleMultiplierDuration / 60}s.
 Extra Ball: Small chance on any drop to double the next ball.`;

const highScoreDescriptionText = `High Score Mode:

Start: ${highScoreStartingGold} gold = ${highScoreBallsTotal} balls (Fixed cost: ${highScoreBallCost} gold/ball).
Bet: Cost is fixed at ${highScoreBallCost} gold per ball. Cannot be changed.
Goal: Earn max points via multipliers & climb the global leaderboard.
End: Game finishes when you run out of ${highScoreBallsTotal} balls. Final points shown.
Purity: No power-ups or bonuses. Pure skill challenge!`;


// Global Variables
let currentScale = 1; let scaledCanvasWidth, scaledCanvasHeight; let gameAreaWidth, menuWidth, menuStartX; let lastPegRowY; let slotStartY; let score = 0; let sessionScore = 0; let highScorePoints = 0;
let gameState = 'LAUNCH_MENU'; let currentGameMode = null; let betAmount = minBetAmount; let gravityScale = defaultActualGravity; let currentBallRadius = baseBallRadius; let titleFont, uiFont, slotFont; let titleY, titleSize; let uiSideMargin, uiScoreTextSize; let buttonTextSize, buttonWidth, buttonHeight; let slotTextSize; let scoreY; let speedSlider, amountSlider, betSlider, ballSizeSlider, sfxVolumeSlider, musicVolumeSlider; let sliderWidth, sliderHandleSize; let bounceAmplitude; let recentHits = []; let multiplierPanelX, multiplierPanelY, multiplierPanelWidth, multiplierPanelHeight, multiplierPanelItemHeight, multiplierPanelItemSpacing, multiplierPanelTextSize, multiplierPanelBorderRadius; let timerTextSize; let powerupTimerDisplayX; let powerupTimerDisplayY; let oddsDisplayYLine1, oddsDisplayYLine2, oddsDisplayTextSize, oddsLineSpacing;
let creatorTextY1, creatorTextY2, creatorTextSize; let versionTextY, versionTextSize;
let dropButtonY;
let isNextDropBonus = false;
let bonusBallMessage = '', bonusBallTimer = 0;
let isDoubleDropActive = false, doubleDropTimer = 0;
let isDoubleMultiplierActive = false, doubleMultiplierTimer = 0;
let doubleDropMessage = '', doubleDropMessageTimer = 0;
let doubleMultiplierMessage = '', doubleMultiplierMessageTimer = 0;
let showTrails = false; let showAnalyzer = true; let blopSound, bonusSound, backgroundMusic; let sfxVolume = defaultSfxVolume;
let musicVolume = defaultMusicVolume;
let audioStarted = false;
let isGameOverConditionMet = false;
let isGameOverFromDecay = false;
let goldLossFlashActive = false; let goldLossFlashEndFrame = 0;
let markerX, markerY, markerMinX, markerMaxX, markerSpeed, markerDirection = 1, markerSize; let ballsRemaining = 0; let highScoreEnded = false;
let survivalStartTime = 0; let lastDecayTime = 0; let currentDecayPercent = 0; let nextDecayTime = Infinity;
let isGoldLossCountdownActive = false; let goldLossCountdownValue = 0; let goldLossCountdownAnimProgress = 0;
let goldLossMessageActive = false; let goldLossMessageProgress = 0; let goldLostAmountForDisplay = 0;
let launchMenuDiv; let survivalButton, highScoreButton; let menuAlpha = 0; let parallaxLayers = []; let menuParticles = []; let menuFallingBalls = [];
let transitionState = 'NONE'; let transitionProgress = 0; let transitionTargetState = ''; let transitionCallback = null;
let isHoveringSurvival = false;
let isHoveringHighScore = false;
let survivalHoverAnimProgress = 0;
let highScoreHoverAnimProgress = 0;

// --- Hover Leaderboard Variables ---
let survivalLeaderboardAnimProgress = 0;
let highScoreLeaderboardAnimProgress = 0;
let survivalLeaderboardData = null;
let highScoreLeaderboardData = null;
let survivalLeaderboardLoading = false;
let highScoreLeaderboardLoading = false;
let survivalLeaderboardError = null;
let highScoreLeaderboardError = null;


let gameOverState = 'NONE';
let leaderboardData = null;
let leaderboardLoading = false;
let leaderboardError = null;
let leaderboardTextSize, leaderboardTitleSize, leaderboardYOffset, leaderboardEntrySpacing;
let canvas;


// ============================ SCALING FUNCTION ============================
function calculateLayout(w, h) {
    let scaleX = w / baseCanvasWidth; let scaleY = h / baseCanvasHeight; currentScale = min(scaleX, scaleY); currentScale = max(currentScale, 0.4);
    scaledCanvasWidth = baseCanvasWidth * currentScale; scaledCanvasHeight = baseCanvasHeight * currentScale; gameAreaWidth = baseGameAreaWidth * currentScale; menuWidth = baseMenuWidth * currentScale; menuStartX = gameAreaWidth;

    titleY = baseTitleY * currentScale; titleSize = baseTitleSize * currentScale;
    uiSideMargin = baseUISideMargin * currentScale;
    uiScoreTextSize = max(7, baseUIScoreTextSize * currentScale);
    slotTextSize = max(5, baseSlotTextSize * currentScale);
    buttonTextSize = max(7, baseButtonTextSize * currentScale);
    multiplierPanelTextSize = max(8, baseMultiplierPanelTextSize * currentScale);
    oddsDisplayTextSize = max(7, baseOddsDisplayTextSize * currentScale);
    creatorTextSize = max(8, baseCreatorTextSize * currentScale);
    timerTextSize = max(12, baseTimerTextSize * currentScale);

    buttonWidth = baseButtonWidth * currentScale; buttonHeight = baseButtonHeight * currentScale;
    scoreY = baseScoreY * currentScale;
    sliderWidth = baseSliderWidth * currentScale; sliderHandleSize = baseSliderHandleSize * currentScale;
    bounceAmplitude = baseBounceAmplitude * currentScale;
    multiplierPanelWidth = baseMultiplierPanelWidth * currentScale; multiplierPanelHeight = baseMultiplierPanelHeight * currentScale;
    multiplierPanelX = baseMultiplierPanelLeftMargin * currentScale;
    multiplierPanelY = baseMultiplierPanelTopMargin * currentScale;
    multiplierPanelItemHeight = baseMultiplierPanelItemHeight * currentScale; multiplierPanelItemSpacing = baseMultiplierPanelItemSpacing * currentScale; multiplierPanelBorderRadius = baseMultiplierPanelBorderRadius * currentScale;
    powerupTimerDisplayX = multiplierPanelX + multiplierPanelWidth + (basePowerupTimerXOffset * currentScale); powerupTimerDisplayY = multiplierPanelY + (basePowerupTimerYOffset * currentScale);
    dropButtonY = baseDropButtonY * currentScale;

    // Settings Panel Layout
    let sliderX = (menuWidth - sliderWidth) / 2;
    let scaledSliderOriginSpacing = max(60 * currentScale, baseSliderOriginSpacing * currentScale);
    let settingsPanelTopMargin = 60 * currentScale;
    let currentContentOriginY = settingsPanelTopMargin;
    if (speedSlider) { speedSlider.x = sliderX; speedSlider.y = currentContentOriginY; }
    currentContentOriginY += scaledSliderOriginSpacing;
    if (betSlider) {
        betSlider.x = sliderX;
        betSlider.y = currentContentOriginY;
        betSlider.minVal = minBetAmount;
        betSlider.maxVal = maxBetAmount;
        let betSliderTrackY = betSlider.y + 25 * currentScale;
        oddsDisplayYLine1 = betSliderTrackY + baseOddsDisplayYOffsetFromTrack * currentScale;
        oddsLineSpacing = max(6 * currentScale, baseOddsLineSpacing * currentScale);
        oddsDisplayYLine2 = oddsDisplayYLine1 + oddsDisplayTextSize + oddsLineSpacing;
    }
    currentContentOriginY += scaledSliderOriginSpacing;
    if (ballSizeSlider) { ballSizeSlider.x = sliderX; ballSizeSlider.y = currentContentOriginY; }
    currentContentOriginY += scaledSliderOriginSpacing;
    if (sfxVolumeSlider) { sfxVolumeSlider.x = sliderX; sfxVolumeSlider.y = currentContentOriginY; }
    currentContentOriginY += scaledSliderOriginSpacing;
    if (musicVolumeSlider) { musicVolumeSlider.x = sliderX; musicVolumeSlider.y = currentContentOriginY; }

    // Version Text Y Position
    let scaledVersionTextBottomMargin = versionTextBottomMargin * currentScale;
    versionTextSize = max(6, creatorTextSize * 0.7);
    versionTextY = scaledCanvasHeight - scaledVersionTextBottomMargin;

    // Creator Text Y Position
    let scaledCreatorLineSpacing = max(6 * currentScale, creatorLineSpacing * currentScale);
    let creatorVersionPadding = settingsCreatorVersionPadding * currentScale;
    creatorTextY2 = versionTextY - versionTextSize - creatorVersionPadding;
    creatorTextY1 = creatorTextY2 - creatorTextSize - scaledCreatorLineSpacing;

    // Marker positioning
    markerSpeed = baseMarkerSpeed * currentScale; markerSize = baseMarkerSize * currentScale; markerY = (baseStartYPegs - 30) * currentScale; if (topRowOuterPegsX.length === 2) { markerMinX = topRowOuterPegsX[0]; markerMaxX = topRowOuterPegsX[1]; if (!markerX) markerX = markerMinX; }

    // Launch Menu HTML styling
    if (launchMenuDiv) {
        let menuW = 280 * currentScale;
        let menuH = 220 * currentScale;
        let menuPadding = max(10, 20 * currentScale);
        let buttonMarginTop = max(8, 15 * currentScale);
        let buttonInternalW = menuW * 0.8;
        let buttonInternalH = buttonHeight * 1.1;
        launchMenuDiv.size(menuW, menuH);
        let canvasOffsetX = (windowWidth - scaledCanvasWidth) / 2;
        let canvasOffsetY = (windowHeight - scaledCanvasHeight) / 2;
        let menuTargetXWindow = (windowWidth / 2) - (launchMenuDiv.width / 2);
        let launchTitleTrueSize = (baseTitleSize * currentScale) * 2.0;
        let titleCenterYCanvas = scaledCanvasHeight * 0.3;
        let titleAbsoluteBottomEdgeWindow = canvasOffsetY + titleCenterYCanvas + (launchTitleTrueSize / 2);
        let desiredSpacing = launchMenuSpacingBelowTitle * currentScale;
        let menuTargetYWindow = titleAbsoluteBottomEdgeWindow + desiredSpacing;
        let minPadding = 10 * currentScale;
        menuTargetXWindow = max(menuTargetXWindow, minPadding);
        menuTargetYWindow = max(menuTargetYWindow, minPadding);
        menuTargetXWindow = min(menuTargetXWindow, windowWidth - launchMenuDiv.width - minPadding);
        menuTargetYWindow = min(menuTargetYWindow, windowHeight - launchMenuDiv.height - minPadding);

        launchMenuDiv.position(menuTargetXWindow, menuTargetYWindow);
        launchMenuDiv.style('padding', `${menuPadding}px`);
        launchMenuDiv.style('background-color', 'rgba(30, 20, 50, 0.9)');
        launchMenuDiv.style('border', '2px solid white');
        launchMenuDiv.style('border-radius', '12px');
        launchMenuDiv.style('text-align', 'center');
        launchMenuDiv.style('color', 'white');
        launchMenuDiv.style('font-family', uiFont);
        launchMenuDiv.style('font-size', `${max(10, 16 * currentScale)}px`);
        launchMenuDiv.style('z-index', '20');

        let heading = launchMenuDiv.elt.getElementsByTagName('h3')[0];
        if(heading) {
            heading.style.fontSize = `${max(12, 18 * currentScale)}px`;
            heading.style.marginBottom = `${buttonMarginTop * 1.2}px`;
            heading.style.marginTop = `0px`;
        }
        let buttons = launchMenuDiv.elt.getElementsByTagName('button');
        for (let btn of buttons) {
            btn.style.display = 'block';
            btn.style.width = `${buttonInternalW}px`;
            btn.style.height = `${buttonInternalH}px`;
            btn.style.margin = `${buttonMarginTop}px auto 0 auto`;
            btn.style.padding = `0`;
            btn.style.fontSize = `${max(10, 16 * currentScale)}px`;
            btn.style.border = 'none';
            btn.style.borderRadius = '6px';
            btn.style.color = 'white';
            btn.style.fontWeight = 'bold';
            btn.style.background = `linear-gradient(to bottom, ${menuButtonGradient[0]}, ${menuButtonGradient[1]})`;
            btn.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out';
            btn.style.cursor = 'pointer';
        }
    }
    // Leaderboard Text Scaling
    leaderboardTextSize = max(9, baseLeaderboardTextSize * currentScale);
    leaderboardTitleSize = max(18, baseLeaderboardTitleSize * currentScale);
    leaderboardYOffset = baseLeaderboardYOffset * currentScale;
    leaderboardEntrySpacing = baseLeaderboardEntrySpacing * currentScale;
}

// ============================ P5JS Core Functions ============================
function preload() {
    titleFont = 'Impact, sans-serif';
    uiFont = 'Consolas, "Lucida Console", monospace';
    slotFont = 'Consolas, "Lucida Console", monospace';
    soundFormats('mp3');
    try {
        blopSound = loadSound('sounds/blop.mp3');
        bonusSound = loadSound('sounds/bonus.mp3');
        backgroundMusic = loadSound('sounds/set_synthwave.mp3', musicLoadedCallback);
    } catch (e) {
        console.error("Sound loading error:", e);
        blopSound = { play: () => {}, setVolume: () => {}, isLoaded: () => false };
        bonusSound = { play: () => {}, setVolume: () => {}, isLoaded: () => false };
        backgroundMusic = { setVolume: () => {}, loop: () => {}, stop: () => {}, isPlaying: () => false, isLoaded: () => false };
    }
}

function musicLoadedCallback() {
    if (audioStarted && musicVolume > 0.01 && !backgroundMusic.isPlaying()) {
        backgroundMusic.setVolume(musicVolume);
        try {
             backgroundMusic.loop();
             console.log("Music started via callback after loading (audio context was ready).");
        } catch (e) { console.error("Error starting music loop in callback:", e); }
    } else if (audioStarted && backgroundMusic.isPlaying()) {
         backgroundMusic.setVolume(musicVolume);
     } else {
         console.log("Music loaded, but audio context not started or volume too low. Will start on interaction.");
     }
 }

function setup() {
    calculateLayout(windowWidth, windowHeight);
    canvas = createCanvas(scaledCanvasWidth, scaledCanvasHeight);
    canvas.elt.style.display = 'block';
    rectMode(CORNER);
    colorMode(RGB);
    pixelDensity(1);

    launchMenuDiv = createDiv('<h3>Choose Mode:</h3>');
    if (!launchMenuDiv) { console.error("FATAL: createDiv failed to create launchMenuDiv!"); alert("Error: Failed to create menu elements. Please refresh."); return; }
    calculateLayout(windowWidth, windowHeight);
    survivalButton = createButton('Survival');
    survivalButton.parent(launchMenuDiv);
    survivalButton.mousePressed(() => { firstInteraction(); startTransition('PLAYING', selectSurvivalMode); });
    survivalButton.mouseOver(() => {
        isHoveringSurvival = true;
        isHoveringHighScore = false;
        survivalButton.style('transform', `scale(${menuButtonHoverScale})`);
        survivalButton.style('box-shadow', `0 0 18px 6px ${menuButtonHoverGlow}`);
        highScoreButton.style('transform', 'scale(1.0)');
        highScoreButton.style('box-shadow', 'none');
    });
    survivalButton.mouseOut(() => {
        isHoveringSurvival = false;
        survivalButton.style('transform', 'scale(1.0)');
        survivalButton.style('box-shadow', 'none');
    });
    highScoreButton = createButton('High Score');
    highScoreButton.parent(launchMenuDiv);
    highScoreButton.mousePressed(() => { firstInteraction(); startTransition('PLAYING', selectHighScoreMode); });
    highScoreButton.mouseOver(() => {
        isHoveringHighScore = true;
        isHoveringSurvival = false;
        highScoreButton.style('transform', `scale(${menuButtonHoverScale})`);
        highScoreButton.style('box-shadow', `0 0 18px 6px ${menuButtonHoverGlow}`);
        survivalButton.style('transform', 'scale(1.0)');
        survivalButton.style('box-shadow', 'none');
    });
    highScoreButton.mouseOut(() => {
        isHoveringHighScore = false;
        highScoreButton.style('transform', 'scale(1.0)');
        highScoreButton.style('box-shadow', 'none');
    });
    launchMenuDiv.hide();
    menuAlpha = 0;

    engine = Engine.create();
    world = engine.world;
    engine.world.gravity.y = gravityScale;
    engineInitialized = true;

    activeParticles = []; activeRipples = []; backgroundRipples = []; recentHits = [];
    showAnalyzer = true;
    for (let i = 0; i < numSlots; i++) { slotHitCounts[i] = 0; slotBounceState[i] = 0; histogramBarPulseState[i] = 0; slotGlowState[i] = 0; }
    speedSlider = { value: defaultSpeedSliderDisplay, minVal: minSpeedSliderDisplayValue, maxVal: maxSpeedSliderDisplayValue, label: "Speed", dragging: false, enabled: true };
    betSlider = { value: minBetAmount, minVal: minBetAmount, maxVal: maxBetAmount, label: "Bet Amount", dragging: false, enabled: true };
    ballSizeSlider = { value: currentBallRadius, minVal: minBallRadius, maxVal: maxBallRadius, label: "Ball Size", dragging: false, enabled: true };
    sfxVolumeSlider = { value: sfxVolume, minVal: 0.0, maxVal: 1.0, label: "SFX Volume", dragging: false, enabled: true };
    musicVolumeSlider = { value: defaultMusicVolume * 100, minVal: 0, maxVal: 100, label: "Music Volume", dragging: false, enabled: true };
    calculateLayout(scaledCanvasWidth, scaledCanvasHeight);

    createPegs();
    setupMenuEffects();
    setupStarfield();
    let scaledPegRadius = basePegRadius * currentScale;
    let scaledPegSlotGap = basePegSlotGap * currentScale;
    if (typeof lastPegRowY === 'undefined' || lastPegRowY === 0) {
        console.warn("lastPegRowY not set correctly after createPegs, using estimate.");
        lastPegRowY = (baseStartYPegs + (pegRowsTotal - 1) * basePegSpacing * 0.95) * currentScale;
        slotStartY = lastPegRowY + (scaledPegRadius * 2) + (20 * currentScale);
    } else {
        slotStartY = lastPegRowY + scaledPegRadius + scaledPegSlotGap;
    }
    createSlotsAndDividers();
    createBoundaries();

    gameOverState = 'NONE';
    leaderboardData = null; leaderboardLoading = false; leaderboardError = null;
    survivalLeaderboardData = null; highScoreLeaderboardData = null;
    survivalLeaderboardLoading = false; highScoreLeaderboardLoading = false;
    survivalLeaderboardError = null; highScoreLeaderboardError = null;
    survivalLeaderboardAnimProgress = 0; highScoreLeaderboardAnimProgress = 0;

    if (blopSound && blopSound.isLoaded()) blopSound.setVolume(sfxVolumeSlider.value);
    if (bonusSound && bonusSound.isLoaded()) bonusSound.setVolume(sfxVolumeSlider.value);
    Events.on(engine, 'collisionStart', handleCollisions);
    gameState = 'LAUNCH_MENU';
    fetchAllLeaderboards();
}
function windowResized() {
    calculateLayout(windowWidth, windowHeight);
    resizeCanvas(scaledCanvasWidth, scaledCanvasHeight);
    if (!engineInitialized) { console.warn("windowResized called before engine initialization completed. Skipping physics recreation."); return; }
    setupMenuEffects();
    setupStarfield();
    createPegs();
    let scaledPegRadius = basePegRadius * currentScale;
    let scaledPegSlotGap = basePegSlotGap * currentScale;
    if (typeof lastPegRowY === 'undefined' || lastPegRowY === 0) {
         console.warn("windowResized: lastPegRowY not set correctly after createPegs, using estimate.");
         lastPegRowY = (baseStartYPegs + (pegRowsTotal - 1) * basePegSpacing * 0.95) * currentScale;
         slotStartY = lastPegRowY + (scaledPegRadius * 2) + (20 * currentScale);
    } else {
         slotStartY = lastPegRowY + scaledPegRadius + scaledPegSlotGap;
    }
    createSlotsAndDividers();
    createBoundaries();
     if (markerMinX !== undefined && markerMaxX !== undefined && markerX !== undefined) {
         markerX = constrain(markerX, markerMinX, markerMaxX);
     }
     const form = document.getElementById('leaderboard-form');
     if (form && form.style.display !== 'none') {
         positionLeaderboardForm(form);
     }
}

// ============================ draw() Structure ============================
function draw() {
    if (transitionState !== 'NONE') {
        handleTransition();
        if (transitionState === 'FADING_OUT' || transitionState === 'FADING_IN') {
             drawCurrentState();
        }
        drawTransitionOverlay();
        return;
    }
    drawCurrentState();
}

// ============================ drawCurrentState() ============================
function drawCurrentState() {
    if (goldLossFlashActive && frameCount > goldLossFlashEndFrame) {
        goldLossFlashActive = false;
    }
    if (gameState === 'PLAYING' && currentGameMode === 'SURVIVAL') {
        updateGoldLossVisuals();
    }

    if (gameState === 'LAUNCH_MENU') {
        background(20, 15, 40);
        if (!launchMenuDiv) { /* Error handling */ }
        else {
             if (menuAlpha < 255 && transitionState === 'NONE') {
                 const currentDisplay = launchMenuDiv.style('display');
                 if (menuAlpha === 0 && currentDisplay === 'none') { launchMenuDiv.show(); }
                 menuAlpha = min(menuAlpha + menuFadeInSpeed, 255);
                 launchMenuDiv.style('opacity', menuAlpha / 255);
             }
             else if (transitionState === 'NONE') {
                  const currentDisplay = launchMenuDiv.style('display');
                  if (currentDisplay === 'none') { launchMenuDiv.show(); }
                  if (launchMenuDiv.style('opacity') !== '1') { launchMenuDiv.style('opacity', 1); }
                  if (menuAlpha < 255) menuAlpha = 255;

                  if (menuAlpha >= 255 && !audioStarted) {
                      firstInteraction();
                  }
             }
        }
        drawMenuBackgroundEffects(menuAlpha);
        drawLaunchTitle(menuAlpha);

        let animStep = 1.0 / HOVER_ANIM_DURATION;

        if (isHoveringSurvival) { survivalHoverAnimProgress = min(1.0, survivalHoverAnimProgress + animStep); }
        else { survivalHoverAnimProgress = max(0.0, survivalHoverAnimProgress - animStep); }

        if (isHoveringHighScore) { highScoreHoverAnimProgress = min(1.0, highScoreHoverAnimProgress + animStep); }
        else { highScoreHoverAnimProgress = max(0.0, highScoreHoverAnimProgress - animStep); }

        if (isHoveringSurvival) { survivalLeaderboardAnimProgress = min(1.0, survivalLeaderboardAnimProgress + animStep); }
        else { survivalLeaderboardAnimProgress = max(0.0, survivalLeaderboardAnimProgress - animStep); }

        if (isHoveringHighScore) { highScoreLeaderboardAnimProgress = min(1.0, highScoreLeaderboardAnimProgress + animStep); }
        else { highScoreLeaderboardAnimProgress = max(0.0, highScoreLeaderboardAnimProgress - animStep); }


        if (launchMenuDiv && transitionState === 'NONE') {
            if (survivalHoverAnimProgress > 0) {
                drawHoverDescription(survivalButton, survivalDescriptionText, survivalHoverAnimProgress, 'TOP', 'SURVIVAL');
            }
            if (highScoreHoverAnimProgress > 0) {
                drawHoverDescription(highScoreButton, highScoreDescriptionText, highScoreHoverAnimProgress, 'BOTTOM', 'HIGHSCORE');
            }
            if (survivalLeaderboardAnimProgress > 0) {
                drawHoverLeaderboard('survival', survivalLeaderboardAnimProgress, survivalLeaderboardData, survivalLeaderboardLoading, survivalLeaderboardError);
            }
            if (highScoreLeaderboardAnimProgress > 0) {
                drawHoverLeaderboard('highscore', highScoreLeaderboardAnimProgress, highScoreLeaderboardData, highScoreLeaderboardLoading, highScoreLeaderboardError);
            }
        }

        if (menuAlpha > 50) {
            push();
            textFont(uiFont);
            textSize(creatorTextSize * 1.0);
            textAlign(CENTER, BOTTOM);
            let textAlpha = map(menuAlpha, 50, 255, 0, 220);
            textAlpha = constrain(textAlpha, 0, 220);
            fill(200, 200, 220, textAlpha);
            let textYPos = scaledCanvasHeight - (launchMenuCreatorTextBottomMargin * currentScale);
            let creatorVersionText = "Created by Yarden Yogev - " + DROP_GAME_VERSION;
            text(creatorVersionText, scaledCanvasWidth / 2, textYPos);
            pop();
        }

        return;
    }

    // --- Draw for PLAYING and GAME_OVER states ---
    background(20, 15, 40);

    if (gameState === 'PLAYING') {
        push(); updateAndDrawBackgroundRipples(); pop();
        fill(35, 30, 55); noStroke(); rect(menuStartX, 0, menuWidth, scaledCanvasHeight);

        Engine.update(engine, FIXED_DELTA_TIME);
        push(); // Game area isolation
        if (currentGameMode === 'SURVIVAL') { handleSurvivalDecay(); }
        if (markerMinX !== undefined && markerMaxX !== undefined) { markerX += markerSpeed * markerDirection; if (markerX >= markerMaxX) { markerX = markerMaxX; markerDirection = -1; } else if (markerX <= markerMinX) { markerX = markerMinX; markerDirection = 1; } }
        if (showTrails) { balls.forEach(ball => { if (ball.plugin && ball.plugin.path) { ball.plugin.path.push({ x: ball.position.x, y: ball.position.y }); if (ball.plugin.path.length > maxTrailLength) ball.plugin.path.shift(); } }); }
        drawPegs(); drawFunnels(); drawSlots();
        push(); updateAndDrawRipples(); pop();
        push(); updateAndDrawParticles(); pop();
        push(); drawBalls(); pop();
        push(); drawMultiplierPanel();
        if (currentGameMode === 'SURVIVAL') {
            push();
            drawPowerupTimer();
            handlePowerupTimersAndVisuals();
            pop();
        }
        push(); drawMarker(); pop(); if (showAnalyzer) { push(); drawStatisticsBars(); pop(); }
        drawTitle();
        drawGameUI();
        drawGoldLossVisuals();
        pop(); // End Game area isolation

        push(); // Settings panel isolation
        translate(menuStartX, 0);
        fill(230); textFont(titleFont); textSize(max(10, 18 * currentScale)); textAlign(CENTER, TOP); text("Settings", menuWidth / 2, 20 * currentScale);
        drawSlider(speedSlider);
        betSlider.enabled = (currentGameMode === 'SURVIVAL');
        drawSlider(betSlider);
        drawSlider(ballSizeSlider);
        drawSlider(sfxVolumeSlider);
        drawSlider(musicVolumeSlider);
        let lastSliderBottomY = 60 * currentScale;
        let sliderToCheck = [musicVolumeSlider, sfxVolumeSlider, ballSizeSlider, betSlider, speedSlider];
        for(let slider of sliderToCheck) { if (slider && typeof slider.y === 'number') { lastSliderBottomY = slider.y + max(60*currentScale, baseSliderOriginSpacing * currentScale); break; } }
        let buttonStartY = lastSliderBottomY;
        let buttonSpacing = buttonHeight + max(10*currentScale, 15 * currentScale);
        let currentButtonY = buttonStartY;
        let buttonX = (menuWidth - buttonWidth) / 2;
        let settingsButtonTextSize = max(7, baseButtonTextSize * currentScale * 1.3);
        drawNeonButton(`Trails: ${showTrails ? 'ON' : 'OFF'}`, buttonX, currentButtonY, buttonWidth, buttonHeight, showTrails ? neonGreen : trueRed, 0, uiFont, settingsButtonTextSize);
        currentButtonY += buttonSpacing;
        drawNeonButton(`Analyzer: ${showAnalyzer ? 'ON' : 'OFF'}`, buttonX, currentButtonY, buttonWidth, buttonHeight, showAnalyzer ? neonGreen : trueRed, 0, uiFont, settingsButtonTextSize);
        currentButtonY += buttonSpacing;
        drawNeonButton("Change Mode", buttonX, currentButtonY, buttonWidth, buttonHeight, neonGreen, 0, uiFont, settingsButtonTextSize);

        let creatorTextX = menuWidth / 2;
        fill(180, 180, 200);
        textFont(uiFont);
        textSize(creatorTextSize);
        textAlign(CENTER, BOTTOM);

        if (typeof creatorTextY1 === 'number' && typeof creatorTextY2 === 'number') {
            text(creatorTextLine1, creatorTextX, creatorTextY1);
            text(creatorTextLine2, creatorTextX, creatorTextY2);
        } else {
            console.warn("Creator text Y coordinates not calculated properly in settings panel.");
            textAlign(CENTER, TOP);
            text(creatorTextLine1, creatorTextX, scaledCanvasHeight - 60 * currentScale);
            text(creatorTextLine2, creatorTextX, scaledCanvasHeight - 45 * currentScale);
        }

        fill(150, 150, 160);
        textSize(versionTextSize);
        textAlign(CENTER, BOTTOM);

        if (typeof versionTextY === 'number' && !isNaN(versionTextY)) {
            text(DROP_GAME_VERSION, creatorTextX, versionTextY);
        } else {
             console.warn("Version text Y coordinate not calculated properly in settings panel.");
            text(DROP_GAME_VERSION, creatorTextX, scaledCanvasHeight - 10 * currentScale);
        }
        pop(); // End Settings panel isolation

    } else if (gameState === 'GAME_OVER') {
        push();
        drawStarfield();
        drawGameOverOverlay();
        pop();
    }

    // --- Game Over Condition Checking ---
    if (gameState === 'PLAYING' && !isGameOverConditionMet) {
        if (currentGameMode === 'HIGHSCORE' && ballsRemaining <= 0 && balls.length === 0) {
            isGameOverConditionMet = true;
            highScoreEnded = true;
        } else if (currentGameMode === 'SURVIVAL' && score < minBetAmount && balls.length === 0) {
            isGameOverConditionMet = true;
        } else if (currentGameMode === 'SURVIVAL' && score <= 0 && balls.length === 0) {
             isGameOverConditionMet = true;
        }
    }

    // --- Transition TO GAME_OVER state if condition met ---
    if (isGameOverConditionMet && gameState === 'PLAYING') {
        let transitionNow = false;
        if (isGameOverFromDecay) {
             transitionNow = true;
             if (DEBUG_MODE) console.log("Transitioning to GAME OVER due to 100% decay.");
        } else if (balls.length === 0) {
             transitionNow = true;
             if (DEBUG_MODE) console.log("Transitioning to GAME OVER (balls cleared).");
        }

        if (transitionNow) {
             if (score < 0) score = 0;
             startTransition('GAME_OVER', () => {
                 gameState = 'GAME_OVER';
                 gameOverState = 'SHOWING_FORM';
                 leaderboardData = null; leaderboardLoading = false; leaderboardError = null;
                 let scoreToSubmit = (currentGameMode === 'HIGHSCORE') ? highScorePoints : sessionScore;
                 const form = document.getElementById('leaderboard-form');
                 if(form) {
                    showLeaderboardForm(scoreToSubmit, currentGameMode.toLowerCase());
                 } else {
                     console.error("Cannot show leaderboard form - element not found!");
                     gameOverState = 'SHOWING_LEADERBOARD';
                     fetchLeaderboardData('endgame', currentGameMode);
                 }
             });
             isGameOverFromDecay = false;
        }
    }
}

// ============================ Transition Functions ============================
function startTransition(targetState, callback = null) {
    if (transitionState !== 'NONE') return;
    transitionTargetState = targetState;
    transitionCallback = callback;
    transitionState = 'FADING_OUT';
    transitionProgress = 0;
    if (launchMenuDiv && launchMenuDiv.style('display') !== 'none') { launchMenuDiv.hide(); }
    if(gameState === 'GAME_OVER' || gameOverState === 'SHOWING_FORM') {
        hideLeaderboardForm();
    }
    isHoveringSurvival = false;
    isHoveringHighScore = false;
    survivalHoverAnimProgress = 0;
    highScoreHoverAnimProgress = 0;
    survivalLeaderboardAnimProgress = 0;
    highScoreLeaderboardAnimProgress = 0;
}

function handleTransition() {
    transitionProgress += 1 / transitionDuration;
    transitionProgress = min(transitionProgress, 1);

    if (transitionState === 'FADING_OUT') {
        if (transitionProgress >= 1) {
            let previousGameState = gameState;
            gameState = 'PREPARING';
            if (transitionCallback) { transitionCallback(); }
            if (gameState === 'PREPARING') { gameState = transitionTargetState; }
            transitionState = 'FADING_IN';
            transitionProgress = 0;
            if (gameState === 'LAUNCH_MENU') {
                if (launchMenuDiv) { calculateLayout(windowWidth, windowHeight); launchMenuDiv.show(); launchMenuDiv.style('opacity', '0'); }
                menuAlpha = 0;
                isHoveringSurvival = false;
                isHoveringHighScore = false;
                survivalHoverAnimProgress = 0;
                highScoreHoverAnimProgress = 0;
                survivalLeaderboardAnimProgress = 0;
                highScoreLeaderboardAnimProgress = 0;
                fetchAllLeaderboards();
            }
            if(previousGameState === 'GAME_OVER' && gameState !== 'GAME_OVER') { hideLeaderboardForm(); }
        }
    } else if (transitionState === 'FADING_IN') {
        if (gameState === 'LAUNCH_MENU' && launchMenuDiv) {
             let currentOpacity = map(transitionProgress, 0, 1, 0, 1);
             launchMenuDiv.style('opacity', currentOpacity);
             menuAlpha = currentOpacity * 255;
        }
        if (transitionProgress >= 1) {
            transitionState = 'NONE';
            transitionProgress = 0;
            transitionTargetState = '';
            transitionCallback = null;
             if (gameState === 'LAUNCH_MENU' && launchMenuDiv) { launchMenuDiv.style('opacity', '1'); menuAlpha = 255; }
        }
    }
}

function drawTransitionOverlay() {
    let alpha = 0;
    if (transitionState === 'FADING_OUT') { alpha = map(transitionProgress, 0, 1, 0, 255); }
    else if (transitionState === 'FADING_IN') { alpha = map(transitionProgress, 0, 1, 255, 0); }
    if (alpha > 0) { push(); fill(20, 15, 40, alpha); noStroke(); rect(0, 0, width, height); pop(); }
}

// ============================ Mode Selection & Start ============================
function selectSurvivalMode() { currentGameMode = 'SURVIVAL'; prepareGameForMode(); }
function selectHighScoreMode() { currentGameMode = 'HIGHSCORE'; prepareGameForMode(); }
function prepareGameForMode() { if (!currentGameMode) { console.error("Cannot prepare game: No mode selected!"); startTransition('LAUNCH_MENU', returnToLaunchMenuCleanup); return; } isGameOverConditionMet = false; highScoreEnded = false; resetGame(); }


// ============================ Helper Functions ============================
function getLaunchMenuCanvasRect() {
    if (!launchMenuDiv) return null;
    const menuPos = launchMenuDiv.position();
    const menuSize = launchMenuDiv.size();
    const canvasOffsetX = (windowWidth - scaledCanvasWidth) / 2;
    const canvasOffsetY = (windowHeight - scaledCanvasHeight) / 2;
    return {
        x: menuPos.x - canvasOffsetX,
        y: menuPos.y - canvasOffsetY,
        width: menuSize.width,
        height: menuSize.height
    };
}


// ============================ Starfield & Effects Setup / Drawing ============================
function setupMenuEffects() { colorMode(RGB, 255); parallaxLayers = []; let baseRadius = basePegRadius * currentScale * 1.5; for (let i = 0; i < parallaxLayersCount; i++) { let layer = []; let layerRadius = baseRadius * (1 - i * 0.2); for (let j = 0; j < parallaxPegsPerLayer; j++) { layer.push({ x: random(scaledCanvasWidth), y: random(scaledCanvasHeight), radius: layerRadius }); } parallaxLayers.push(layer); } menuParticles = []; const scaledParticleSpeed = menuParticleBaseSpeed * currentScale; for (let i = 0; i < menuParticleCount; i++) { menuParticles.push({ x: random(scaledCanvasWidth), y: random(scaledCanvasHeight), vx: random(-scaledParticleSpeed, scaledParticleSpeed), vy: random(-scaledParticleSpeed, scaledParticleSpeed), lifespan: random(menuParticleLifespan * 0.5, menuParticleLifespan), maxLifespan: menuParticleLifespan, radius: random(1, 3) * currentScale, color: [random(150, 255), random(150, 255), random(220, 255)] }); } menuFallingBalls = []; let scaledBallRad = baseBallRadius * currentScale * 0.8; let baseFallingColor = color(neonBlue[0], neonBlue[1], neonBlue[2]); colorMode(HSB, 360, 100, 100, 1); for (let i = 0; i < menuFallingBallCount; i++) { let h = hue(baseFallingColor) + random(-15, 15); let s = saturation(baseFallingColor) * random(0.85, 1.0); let b = brightness(baseFallingColor) * random(0.9, 1.1); let a = random(0.2, 0.6); let variedColor = color(h, s, b, a); colorMode(RGB, 255); menuFallingBalls.push({ x: random(scaledCanvasWidth), y: random(-scaledCanvasHeight * 0.5, 0), vy: random(menuBackgroundBallSpeedMin, menuBackgroundBallSpeedMax) * currentScale, radius: scaledBallRad * random(0.7, 1.1), color: variedColor }); } colorMode(RGB, 255); }
function drawMenuBackgroundEffects(overallAlpha) { if (overallAlpha <= 0) return; push(); let centerX = scaledCanvasWidth / 2; let centerY = scaledCanvasHeight / 2; let mouseXConstrained = constrain(mouseX, 0, width); let mouseYConstrained = constrain(mouseY, 0, height); let mouseOffsetX = (mouseXConstrained - centerX) * parallaxMaxOffsetFactor; let mouseOffsetY = (mouseYConstrained - centerY) * parallaxMaxOffsetFactor; noStroke(); for (let i = 0; i < parallaxLayers.length; i++) { let layer = parallaxLayers[i]; let layerFactor = (parallaxLayers.length - i) / parallaxLayers.length; let currentOffsetX = mouseOffsetX * layerFactor; let currentOffsetY = mouseOffsetY * layerFactor; let layerAlpha = 100 * (1 - i * 0.2); fill(180, 200, 220, layerAlpha * (overallAlpha / 255)); for (let peg of layer) { ellipse(peg.x + currentOffsetX, peg.y + currentOffsetY, peg.radius * 2); } } noStroke(); let scaledParticleSpeed = menuParticleBaseSpeed * currentScale; for (let i = menuParticles.length - 1; i >= 0; i--) { let p = menuParticles[i]; if (overallAlpha > 10) { p.x += p.vx; p.y += p.vy; p.lifespan--; } if (p.x < -p.radius) p.x = scaledCanvasWidth + p.radius; if (p.x > scaledCanvasWidth + p.radius) p.x = -p.radius; if (p.y < -p.radius) p.y = scaledCanvasHeight + p.radius; if (p.y > scaledCanvasHeight + p.radius) p.y = -p.radius; if (p.lifespan <= 0) { p.x = random(scaledCanvasWidth); p.y = random(scaledCanvasHeight); p.vx = random(-scaledParticleSpeed, scaledParticleSpeed); p.vy = random(-scaledParticleSpeed, scaledParticleSpeed); p.lifespan = random(menuParticleLifespan * 0.5, menuParticleLifespan); } else { let lifeRatio = p.lifespan / p.maxLifespan; let particleAlpha = 150 * sin(lifeRatio * PI); fill(p.color[0], p.color[1], p.color[2], particleAlpha * (overallAlpha / 255)); ellipse(p.x, p.y, p.radius * 2); } } noStroke(); let gravityEffect = menuBackgroundBallGravity * currentScale; for (let i = menuFallingBalls.length - 1; i >= 0; i--) { let ball = menuFallingBalls[i]; if (overallAlpha > 10) { ball.vy += gravityEffect; ball.y += ball.vy; } let r = red(ball.color); let g = green(ball.color); let b = blue(ball.color); let baseAlpha = alpha(ball.color); fill(r, g, b, baseAlpha * 255 * (overallAlpha / 255)); ellipse(ball.x, ball.y, ball.radius * 2); if (ball.y > scaledCanvasHeight + ball.radius * 2) { ball.x = random(scaledCanvasWidth); ball.y = -ball.radius * 2 - random(50 * currentScale); ball.vy = random(menuBackgroundBallSpeedMin, menuBackgroundBallSpeedMax) * currentScale; } } pop(); }
function setupStarfield() { starfield = []; shootingStars = []; colorMode(HSB, 360, 100, 100, 1); for (let i = 0; i < numStars; i++) { let size = random(0.8, 3.8) * currentScale; let depth = map(size, 0.8 * currentScale, 3.8 * currentScale, 0.1, 1.0); let speedMult = lerp(1.0, 1.0 + baseStarParallaxFactor, depth); starfield.push({ x: random(gameAreaWidth), y: random(scaledCanvasHeight), size: size, depth: depth, brightness: random(60, 100), alpha: random(0.45, 1.0), base_vx: random(-0.1, 0.1) * starfieldSpeedFactor * currentScale * speedMult, base_vy: random(0.05, 0.2) * starfieldSpeedFactor * currentScale * speedMult, h: random(240, 300), s: random(50, 90), twinkleOffset: random(TWO_PI) }); } colorMode(RGB, 255); }
function drawStarfield() { push(); colorMode(HSB, 360, 100, 100, 1); noStroke(); let timeFactor = frameCount * 0.05; let speedBoost = (gameState === 'GAME_OVER') ? gameOverSpeedMultiplier : 1.0; for (let i = starfield.length - 1; i >= 0; i--) { let star = starfield[i]; let current_vx = star.base_vx * speedBoost; let current_vy = star.base_vy * speedBoost; star.x += current_vx; star.y += current_vy; if (star.x < 0) star.x = gameAreaWidth; if (star.x > gameAreaWidth) star.x = 0; if (star.y < 0) star.y = scaledCanvasHeight; if (star.y > scaledCanvasHeight) star.y = 0; star.h = (star.h + starHueShiftSpeed) % 360; let twinkle = sin(timeFactor + star.twinkleOffset) * 0.2 + 0.8; let currentBrightness = star.brightness * twinkle; let currentAlpha = star.alpha * twinkle; fill(star.h, star.s, currentBrightness, currentAlpha); ellipse(star.x, star.y, star.size); } if (random() < shootingStarChance) { let startX = random(gameAreaWidth); let startY = random(-50 * currentScale, 0); let speed = random(shootingStarSpeedMin, shootingStarSpeedMax) * currentScale; let angle = random(PI * 0.4, PI * 0.6); shootingStars.push({ x: startX, y: startY, vx: cos(angle) * speed, vy: sin(angle) * speed, len: shootingStarLength * currentScale, alpha: 255, maxLife: 80, life: 80 }); } strokeWeight(max(1, 1.5 * currentScale)); colorMode(RGB, 255); for (let i = shootingStars.length - 1; i >= 0; i--) { let ss = shootingStars[i]; ss.x += ss.vx; ss.y += ss.vy; ss.life--; if (ss.life <= 0) { shootingStars.splice(i, 1); } else { let lifeRatio = ss.life / ss.maxLife; let currentAlpha = ss.alpha * lifeRatio; let tailDist = dist(0,0, ss.vx, ss.vy); let tailX = ss.x - (tailDist > 0 ? ss.vx * (ss.len / tailDist) : 0); let tailY = ss.y - (tailDist > 0 ? ss.vy * (ss.len / tailDist) : 0); stroke(shootingStarColor[0], shootingStarColor[1], shootingStarColor[2], currentAlpha * 0.7); line(ss.x, ss.y, tailX, tailY); } } colorMode(RGB, 255); pop(); }
function createParticleBurst(centerX, centerY) { push(); const scaledParticleBaseSpeed = particleBaseSpeed * currentScale; const scaledInitialSize = max(1, baseBallRadius * 0.4 * currentScale); for (let i = 0; i < particleCount; i++) { let angle = random(TWO_PI); let speed = random(0.5, 1.5) * scaledParticleBaseSpeed; let particle = { x: centerX, y: centerY, vx: cos(angle) * speed, vy: sin(angle) * speed, lifespan: particleLifespan, maxLifespan: particleLifespan, initialSize: scaledInitialSize, size: scaledInitialSize, alpha: 200, color: particleColor, gravity: 0.03 * currentScale, drag: 0.985 }; activeParticles.push(particle); } pop(); }
function updateAndDrawParticles() { push(); noStroke(); for (let i = activeParticles.length - 1; i >= 0; i--) { let p = activeParticles[i]; p.lifespan--; p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= p.drag; p.vy *= p.drag; if (p.lifespan <= 0) { activeParticles.splice(i, 1); } else { let progress = p.lifespan / p.maxLifespan; p.size = p.initialSize * pow(progress, 2); p.alpha = 200 * pow(progress, 1.5); if (p.size > 0.5) { fill(p.color[0], p.color[1], p.color[2], p.alpha); ellipse(p.x, p.y, p.size * 2); } } } pop(); }
function createRippleEffect(centerX, centerY, slotWidth) { push(); const scaledMaxRadius = slotWidth * rippleMaxRadiusFactor; const scaledStartWeight = max(1, rippleStartStrokeWeight * currentScale); const scaledEndWeight = max(0.5, rippleEndStrokeWeight * currentScale); let ripple = { cx: centerX, cy: centerY, lifespan: rippleLifespan, maxLifespan: rippleLifespan, initialRadius: 0, maxRadius: scaledMaxRadius, radius: 0, initialAlpha: rippleInitialAlpha, alpha: rippleInitialAlpha, color: rippleColor, strokeWeightStart: scaledStartWeight, strokeWeightEnd: scaledEndWeight, strokeWeight: scaledStartWeight }; activeRipples.push(ripple); pop(); }
function updateAndDrawRipples() { push(); noFill(); for (let i = activeRipples.length - 1; i >= 0; i--) { let r = activeRipples[i]; r.lifespan--; if (r.lifespan <= 0) { activeRipples.splice(i, 1); } else { let progress = 1.0 - (r.lifespan / r.maxLifespan); let easedProgress = 1 - pow(1 - progress, 3); r.radius = lerp(r.initialRadius, r.maxRadius, easedProgress); r.alpha = lerp(r.initialAlpha, 0, easedProgress); r.strokeWeight = lerp(r.strokeWeightStart, r.strokeWeightEnd, progress); if (r.alpha > 1 && r.strokeWeight > 0.1) { stroke(r.color[0], r.color[1], r.color[2], r.alpha); strokeWeight(r.strokeWeight); ellipse(r.cx, r.cy, r.radius * 2); } } } noStroke(); pop(); }
function createBackgroundRipple(centerX, centerY) { const scaledPegRadius = basePegRadius * currentScale; const scaledMaxRadius = scaledPegRadius * backgroundRippleMaxRadiusFactor; const scaledStartWeight = max(1, backgroundRippleStartWeight * currentScale); const scaledEndWeight = max(0.1, backgroundRippleEndWeight * currentScale); let ripple = { cx: centerX, cy: centerY, lifespan: backgroundRippleLifespan, maxLifespan: backgroundRippleLifespan, initialRadius: scaledPegRadius * 0.5, maxRadius: scaledMaxRadius, radius: scaledPegRadius * 0.5, initialAlpha: backgroundRippleInitialAlpha, alpha: backgroundRippleInitialAlpha, color: backgroundRippleColor, strokeWeightStart: scaledStartWeight, strokeWeightEnd: scaledEndWeight, strokeWeight: scaledStartWeight }; backgroundRipples.push(ripple); }
function updateAndDrawBackgroundRipples() { push(); noFill(); for (let i = backgroundRipples.length - 1; i >= 0; i--) { let r = backgroundRipples[i]; r.lifespan--; if (r.lifespan <= 0) { backgroundRipples.splice(i, 1); } else { let progress = 1.0 - (r.lifespan / r.maxLifespan); let easedProgressRadius = 1 - pow(1 - progress, 3); r.radius = lerp(r.initialRadius, r.maxRadius, easedProgressRadius); let easedProgressAlpha = pow(progress, 2); r.alpha = lerp(r.initialAlpha, 0, easedProgressAlpha); r.strokeWeight = lerp(r.strokeWeightStart, r.strokeWeightEnd, progress); if (r.alpha > 1 && r.strokeWeight > 0.1) { stroke(r.color[0], r.color[1], r.color[2], r.alpha); strokeWeight(r.strokeWeight); ellipse(r.cx, r.cy, r.radius * 2); } } } noStroke(); pop(); }

// ============================ Drawing Helpers ============================

// --- Icon Drawing Functions ---
function drawCoinIcon(x, y, size, alpha, animProgress = 0) { push(); let pulseScale = lerp(1.0, 1.1, animProgress); fill(255, 215, 0, alpha); noStroke(); ellipse(x + size / 2, y + size / 2, size * pulseScale, size * pulseScale); fill(200, 160, 0, alpha); ellipse(x + size / 2, y + size / 2, size * 0.6 * pulseScale, size * 0.6 * pulseScale); pop(); }
function drawBallIcon(x, y, size, alpha, animProgress = 0) { push(); let pulseScale = lerp(1.0, 1.1, animProgress); fill(neonBlue[0], neonBlue[1], neonBlue[2], alpha); noStroke(); ellipse(x + size / 2, y + size / 2, size * pulseScale, size * pulseScale); pop(); }
function drawLockIcon(x, y, size, alpha, animProgress = 0) { push(); let bodyH = size * 0.6; let bodyW = size * 0.7; let shackleThick = size * 0.15; let shackleDiam = size * 0.5; let pulseShift = lerp(0, size * 0.05, animProgress); fill(180, 180, 180, alpha); noStroke(); rect(x + (size - bodyW) / 2, y + size * 0.3 + pulseShift, bodyW, bodyH, size * 0.1); noFill(); stroke(220, 220, 220, alpha); strokeWeight(shackleThick); arc(x + size / 2, y + size * 0.3 + pulseShift, shackleDiam, shackleDiam, PI, TWO_PI); pop(); }
function drawTrophyIcon(x, y, size, alpha, animProgress = 0) { push(); let glowAmount = lerp(0, NEON_GLOW_MAX_BLUR * 0.5 * currentScale, animProgress); let baseCol = color(255, 215, 0, alpha); let glowCol = color(255, 235, 100, alpha * 0.7 * animProgress); drawingContext.shadowBlur = glowAmount; drawingContext.shadowColor = glowCol.toString(); fill(baseCol); noStroke(); let cupTopW = size; let cupTopH = size * 0.15; let cupBodyH = size * 0.5; let stemH = size * 0.2; let baseH = size * 0.15; let baseW = size * 0.8; let topY = y; rect(x + (size - baseW) / 2, topY + size - baseH, baseW, baseH); rect(x + (size - size * 0.2) / 2, topY + size - baseH - stemH, size * 0.2, stemH); quad( x + size * 0.15, topY + size - baseH - stemH, x + size * 0.85, topY + size - baseH - stemH, x + size, topY + size - baseH - stemH - cupBodyH, x, topY + size - baseH - stemH - cupBodyH ); ellipse(x + size / 2, topY + size - baseH - stemH - cupBodyH, cupTopW, cupTopH); drawingContext.shadowBlur = 0; pop(); }
function drawSliderIcon(x, y, size, alpha, animProgress = 0) { push(); let handleX = lerp(x + size * 0.1, x + size * 0.9, animProgress); stroke(180, 180, 180, alpha); strokeWeight(max(1, size * 0.1)); line(x + size * 0.1, y + size / 2, x + size * 0.9, y + size / 2); fill(neonYellow[0], neonYellow[1], neonYellow[2], alpha); noStroke(); ellipse(handleX, y + size / 2, size * 0.3, size * 0.3); pop(); }
function drawClockIcon(x, y, size, alpha, animProgress = 0) { push(); let angle = lerp(0, TWO_PI * 2, (frameCount * 0.01) % 1); let handAnim = (sin(frameCount * 0.15) + 1) / 2; let handColor = lerpColor(color(clockHandColor), color(255, 150, 150, alpha), handAnim); let faceColor = color(200, 200, 220, alpha); let glowColor = color(clockHandColor[0], clockHandColor[1], clockHandColor[2], alpha * 0.5 * handAnim); let centerX = x + size / 2; let centerY = y + size / 2; stroke(faceColor); strokeWeight(max(1, size * 0.08)); noFill(); ellipse(centerX, centerY, size, size); drawingContext.shadowBlur = max(2, 6 * currentScale) * handAnim; drawingContext.shadowColor = glowColor.toString(); stroke(handColor); strokeWeight(max(1.2, size * 0.1)); push(); translate(centerX, centerY); push(); rotate(angle); line(0, 0, 0, -size * 0.4); pop(); push(); rotate(angle * 0.1); line(0, 0, 0, -size * 0.25); pop(); pop(); drawingContext.shadowBlur = 0; pop(); }
function drawUpArrowIcon(x, y, size, alpha, animProgress = 0) { push(); let arrowColor = lerpColor(color(180, 255, 180, alpha), color(230, 255, 230, alpha), animProgress); let arrowY = y + lerp(size * 0.1, -size * 0.1, animProgress); let arrowHeadSize = size * 0.5; let shaftWidth = size * 0.25; let shaftHeight = size * 0.5; let arrowTopY = arrowY + size * 0.1; fill(arrowColor); noStroke(); rect(x + (size - shaftWidth) / 2, arrowTopY + arrowHeadSize * 0.6, shaftWidth, shaftHeight); triangle( x + size / 2, arrowTopY, x + size / 2 - arrowHeadSize / 2, arrowTopY + arrowHeadSize * 0.6, x + size / 2 + arrowHeadSize / 2, arrowTopY + arrowHeadSize * 0.6 ); pop(); }
function drawScoringIcon(x, y, size, alpha, animProgress = 0) { push(); let elementSize = size * 0.35; let spacing = size * 0.05; let totalWidth = elementSize * 3 + spacing * 2; let startX = x + (size - totalWidth) / 2; let symbolY = y + size * 0.25; let resultY = y + size * 0.7; let resultSize = size * 0.3; let pulse = (sin(frameCount * 0.15 + PI / 2) + 1) / 2; let fastPulse = (sin(frameCount * 0.25) + 1) / 2; drawCoinIcon(startX, symbolY - elementSize/2, elementSize, alpha * 0.9, pulse); textAlign(CENTER, CENTER); textSize(elementSize * 1.2); fill(200, 200, 230, alpha); text("×", startX + elementSize + spacing + elementSize / 2, symbolY + size*0.02); drawStarIcon(startX + elementSize * 2 + spacing * 2, symbolY - elementSize/2, elementSize, alpha * 0.9, pulse); drawCoinIcon(x + size / 2 - resultSize * 1.2 , resultY - resultSize/2, resultSize, alpha, fastPulse); drawStarIcon(x + size / 2 + spacing, resultY - resultSize/2, resultSize, alpha, fastPulse); pop(); }
function drawSkullIcon(x, y, size, alpha, animProgress = 0) { push(); let mainColor = lerpColor(color(200, 200, 210, alpha), color(240, 240, 250, alpha), animProgress); let shadowColor = color(80, 80, 90, alpha * 0.7); let headW = size * 0.8; let headH = size * 0.7; let eyeSize = size * 0.18; let jawH = size * 0.2; let centerX = x + size / 2; let topY = y + size * 0.1; fill(mainColor); noStroke(); ellipse(centerX, topY + headH / 2, headW, headH); rect(centerX - headW * 0.3, topY + headH * 0.8, headW * 0.6, jawH, size * 0.05); fill(shadowColor); ellipse(centerX - headW * 0.25, topY + headH * 0.4, eyeSize, eyeSize * 1.2); ellipse(centerX + headW * 0.25, topY + headH * 0.4, eyeSize, eyeSize * 1.2); triangle( centerX, topY + headH * 0.55, centerX - size * 0.08, topY + headH * 0.7, centerX + size * 0.08, topY + headH * 0.7 ); pop(); }
function drawHourglassIcon(x, y, size, alpha, animProgress = 0) { push(); let sandColor = color(240, 230, 180, alpha); let frameColor = color(150, 150, 180, alpha); let frameWidth = size * 0.1; let glassNeck = size * 0.15; let topY = y + frameWidth/2; let bottomY = y + size - frameWidth/2; let midY = y + size / 2; let outerW = size; stroke(frameColor); strokeWeight(frameWidth); line(x + frameWidth/2, topY, x + outerW - frameWidth/2, topY); line(x + frameWidth/2, bottomY, x + outerW - frameWidth/2, bottomY); line(x + frameWidth/2, topY, x + size/2 - glassNeck/2, midY); line(x + size/2 - glassNeck/2, midY, x + frameWidth/2, bottomY); line(x + outerW - frameWidth/2, topY, x + size/2 + glassNeck/2, midY); line(x + size/2 + glassNeck/2, midY, x + outerW - frameWidth/2, bottomY); noStroke(); fill(sandColor); let sandProgress = (sin(frameCount * 0.08) + 1) / 2; let topSandHeight = lerp(size/2 - frameWidth, 0, sandProgress); let bottomSandHeight = lerp(0, size/2 - frameWidth, sandProgress); if (topSandHeight > 0.1) { beginShape(); let topWidth = lerp(glassNeck, outerW - frameWidth*2, topSandHeight / (size/2 - frameWidth)); vertex(x + size/2 - topWidth/2, topY + frameWidth + (size/2 - frameWidth - topSandHeight)); vertex(x + size/2 + topWidth/2, topY + frameWidth + (size/2 - frameWidth - topSandHeight)); vertex(x + size/2 + glassNeck/2, midY); vertex(x + size/2 - glassNeck/2, midY); endShape(CLOSE); } if (bottomSandHeight > 0.1) { beginShape(); let bottomWidth = lerp(glassNeck, outerW - frameWidth*2, bottomSandHeight / (size/2 - frameWidth)); vertex(x + size/2 - glassNeck/2, midY); vertex(x + size/2 + glassNeck/2, midY); vertex(x + size/2 + bottomWidth/2, midY + bottomSandHeight); vertex(x + size/2 - bottomWidth/2, midY + bottomSandHeight); endShape(CLOSE); } pop(); }
function drawQuestionMarkIcon(x, y, size, alpha, animProgress = 0) { push(); let mainColor = lerpColor(color(200, 200, 220, alpha), color(255, 255, 255, alpha), animProgress); let glowColor = color(220, 220, 255, alpha * 0.6 * animProgress); drawingContext.shadowBlur = max(2, 5 * currentScale) * animProgress; drawingContext.shadowColor = glowColor.toString(); fill(mainColor); textAlign(CENTER, CENTER); textSize(size * 1.1); textFont(titleFont); text("?", x + size / 2, y + size / 2 + size * 0.08); drawingContext.shadowBlur = 0; pop(); }
function drawDoubleDropIcon(x, y, size, alpha, animProgress) { push(); let ballSize = size * 0.55; let spacing = size * 0.05; let pulseAlpha = lerp(0.6, 1.0, animProgress); let yOff = y + size * 0.2; let xOff1 = x + size * 0.1; let xOff2 = xOff1 + ballSize + spacing; fill(neonBlue[0], neonBlue[1], neonBlue[2], alpha * pulseAlpha * 0.8); ellipse(xOff2 + ballSize / 2, yOff + ballSize / 2, ballSize, ballSize); fill(neonBlue[0], neonBlue[1], neonBlue[2], alpha); ellipse(xOff1 + ballSize / 2, yOff + ballSize / 2, ballSize, ballSize); pop(); }
function draw2xMultiplierIcon(x, y, size, alpha, animProgress) { push(); let brightness = lerp(0.8, 1.5, animProgress); let textColor = color(neonYellow[0] * brightness, neonYellow[1] * brightness, neonYellow[2] * brightness, alpha); drawingContext.shadowBlur = max(2, 4 * currentScale) * animProgress; drawingContext.shadowColor = color(neonYellow[0], neonYellow[1], 0, alpha * 0.5 * animProgress).toString(); fill(textColor); textAlign(LEFT, TOP); textSize(size * 1.0); textFont(titleFont); text("2x", x + size*0.1, y + size * 0.1); drawingContext.shadowBlur = 0; pop(); }
function drawExtraBallPlusIcon(x, y, size, alpha, animProgress) { push(); let ballSize = size * 0.6; let plusSize = size * 0.4; let plusWeight = size * 0.12; let ballX = x + size * 0.3; let ballY = y + size / 2; let plusX = x + size * 0.65; let plusY = y + size / 2; let pulseScale = lerp(1.0, 1.2, animProgress); let plusColor = lerpColor(color(bonusColor), color(255,255,255), animProgress); fill(neonBlue[0], neonBlue[1], neonBlue[2], alpha * 0.9); ellipse(ballX, ballY, ballSize, ballSize); stroke(plusColor); strokeWeight(plusWeight * pulseScale); line(plusX - plusSize*pulseScale/2, plusY, plusX + plusSize*pulseScale/2, plusY); line(plusX, plusY - plusSize*pulseScale/2, plusX, plusY + plusSize*pulseScale/2); pop(); }
function drawStarIcon(x, y, size, alpha, animProgress = 0) { push(); let scaleFactor = lerp(0.9, 1.1, animProgress); fill(neonYellow[0], neonYellow[1], neonYellow[2], alpha); noStroke(); let angle = TWO_PI / 5; let halfAngle = angle / 2.0; beginShape(); let radius1 = size/2 * scaleFactor; let radius2 = size/4 * scaleFactor; for (let a = -PI/2; a < TWO_PI - PI/2; a += angle) { let sx = x + size/2 + cos(a) * radius1; let sy = y + size/2 + sin(a) * radius1; vertex(sx, sy); sx = x + size/2 + cos(a + halfAngle) * radius2; sy = y + size/2 + sin(a + halfAngle) * radius2; vertex(sx, sy); } endShape(CLOSE); pop(); }
function drawCrossedIcon(x, y, size, alpha, animProgress = 0, drawBaseIconFunc = null) { push(); if (drawBaseIconFunc) { drawBaseIconFunc(x, y, size, alpha * 0.7, animProgress); } let crossAlpha = lerp(0.5, 1.0, animProgress); stroke(trueRed[0], trueRed[1], trueRed[2], alpha * crossAlpha); strokeWeight(max(1.5, size * 0.15)); line(x + size * 0.1, y + size * 0.1, x + size * 0.9, y + size * 0.9); line(x + size * 0.1, y + size * 0.9, x + size * 0.9, y + size * 0.1); pop(); }
function drawBallCountAnimation(x, y, size, alpha) { push(); let countSpeed = 0.15; let currentBallNum = highScoreBallsTotal - floor((frameCount * countSpeed) % (highScoreBallsTotal + 1)); textAlign(RIGHT, TOP); textSize(size * 0.9); fill(200, 200, 230, alpha); let numStr = str(currentBallNum); text(numStr, x, y); fill(neonBlue[0], neonBlue[1], neonBlue[2], alpha * 0.8); noStroke(); ellipse(x - textWidth(numStr) - size*0.3 , y + size * 0.4, size*0.5); pop(); }
function drawSurvivalCornerAnimation(x, y, w, h, alpha) { push(); let numCoins = 3; let coinSize = h * 0.6; let fallDist = h * 1.5; let loopTime = 2.0; for (let i = 0; i < numCoins; i++) { let timeOffset = (i / numCoins) * loopTime; let currentLoopTime = (millis() / 1000 + timeOffset) % loopTime; let progress = currentLoopTime / loopTime; let currentY = y + lerp(-coinSize, fallDist, progress * progress); let currentAlpha = alpha * sin(progress * PI); if (currentAlpha > 0 && currentY < y + h + coinSize) { let currentX = x + w / 2 - coinSize / 2 + sin(progress * PI * 3) * w * 0.1; drawCoinIcon(currentX, currentY, coinSize, currentAlpha, 0); } } pop(); }

// --- Hover Leaderboard Drawing Function ---
function drawHoverLeaderboard(mode, animProgress, data, loading, error) {
    if (!launchMenuDiv || animProgress <= 0) return;

    push();

    const scaledPadding = HOVER_LEADERBOARD_BASE_PADDING * currentScale;
    const scaledBoxWidth = HOVER_LEADERBOARD_BASE_WIDTH * currentScale;
    const scaledTitleSize = max(10, HOVER_LEADERBOARD_TITLE_SIZE_BASE * currentScale);
    const scaledTextSize = max(7, HOVER_LEADERBOARD_TEXT_SIZE_BASE * currentScale);
    const scaledEntrySpacing = HOVER_LEADERBOARD_ENTRY_SPACING_BASE * currentScale;
    const entryLineHeight = scaledTextSize + scaledEntrySpacing;
    const titleAreaHeight = scaledTitleSize + scaledPadding * 1.5;

    const scaledOffsetX = HOVER_LEADERBOARD_OFFSET_X * currentScale;
    const targetBgAlpha = 240;
    const targetBorderAlpha = 200;
    const targetTextAlpha = 255;
    const scaledSlideMargin = SLIDE_OFFSCREEN_MARGIN * currentScale;

    let entriesToShow = HOVER_LEADERBOARD_MAX_ENTRIES;
    let contentHeight = 0;
    if (loading || error) {
        contentHeight = entryLineHeight * 2;
    } else if (data) {
        contentHeight = entryLineHeight * min(data.length, entriesToShow);
        if (data.length == 0) {
           contentHeight = entryLineHeight;
        }
    } else {
        contentHeight = entryLineHeight;
    }
    const boxHeight = titleAreaHeight + contentHeight + scaledPadding;

    const menuRect = getLaunchMenuCanvasRect();
    if (!menuRect) { pop(); return; }

    let targetBoxX = menuRect.x + menuRect.width + scaledOffsetX;
    let targetBoxY = menuRect.y + menuRect.height / 2 - boxHeight / 2;
    targetBoxY = constrain(targetBoxY, scaledPadding, scaledCanvasHeight - boxHeight - scaledPadding);
    targetBoxX = min(targetBoxX, scaledCanvasWidth - scaledBoxWidth - scaledPadding);
    targetBoxX = max(targetBoxX, scaledPadding);

    const easedProgress = 1 - pow(1 - animProgress, 3);
    let startBoxY;
    let currentBoxX = targetBoxX;
    let currentBoxY;

    if (mode === 'survival') {
        startBoxY = scaledCanvasHeight + scaledSlideMargin;
        currentBoxY = lerp(startBoxY, targetBoxY, easedProgress);
    } else {
        startBoxY = -boxHeight - scaledSlideMargin;
        currentBoxY = lerp(startBoxY, targetBoxY, easedProgress);
    }

    let finalBgAlpha = targetBgAlpha * easedProgress;
    let finalBorderAlpha = targetBorderAlpha * easedProgress;
    let finalTextAlpha = targetTextAlpha * easedProgress;

    fill(HOVER_LEADERBOARD_BG_COLOR[0], HOVER_LEADERBOARD_BG_COLOR[1], HOVER_LEADERBOARD_BG_COLOR[2], finalBgAlpha);
    stroke(HOVER_LEADERBOARD_BORDER_COLOR[0], HOVER_LEADERBOARD_BORDER_COLOR[1], HOVER_LEADERBOARD_BORDER_COLOR[2], finalBorderAlpha);
    strokeWeight(max(1, 1.5 * currentScale));
    rect(currentBoxX, currentBoxY, scaledBoxWidth, boxHeight, 4 * currentScale);

    fill(HOVER_LEADERBOARD_TEXT_COLOR[0], HOVER_LEADERBOARD_TEXT_COLOR[1], HOVER_LEADERBOARD_TEXT_COLOR[2], finalTextAlpha);
    textFont(uiFont);
    textSize(scaledTitleSize);
    textAlign(CENTER, TOP);
    let titleText = mode === 'survival' ? "Survival Leaders" : "High Score Leaders";
    text(titleText, currentBoxX + scaledBoxWidth / 2, currentBoxY + scaledPadding);

    push();
    noSmooth();

    let currentTextYDraw = currentBoxY + titleAreaHeight;
    let textStartX = currentBoxX + scaledPadding;
    textSize(scaledTextSize);
    textAlign(LEFT, TOP);
    textStyle(NORMAL);

    const maxRankStr = `${entriesToShow}.`;
    const maxNameStr = "WWWWWWWWWW";
    const maxScoreStr = "9,999,999";
    const rankColWidth = textWidth(maxRankStr) + 5 * currentScale;
    const nameColWidth = textWidth(maxNameStr) + 10 * currentScale;
    const rankX = textStartX;
    const nameX = rankX + rankColWidth;
    const scoreAlignRightX = currentBoxX + scaledBoxWidth - scaledPadding;

    if (loading) {
        fill(180, 180, 200, finalTextAlpha);
        textAlign(CENTER, TOP);
        text("Loading...", currentBoxX + scaledBoxWidth / 2, currentTextYDraw);
    } else if (error) {
        fill(softRed[0], softRed[1], softRed[2], finalTextAlpha);
        textAlign(CENTER, TOP);
        text(`Error`, currentBoxX + scaledBoxWidth / 2, currentTextYDraw);
        text(`loading`, currentBoxX + scaledBoxWidth / 2, currentTextYDraw + entryLineHeight);

    } else if (data && data.length > 0) {
        for (let i = 0; i < min(data.length, entriesToShow); i++) {
            let entry = data[i];
            let rank = i + 1;
            let nameStr = (entry.player_name || 'ANON').toUpperCase().substring(0, 10);
            let scoreStr = (typeof entry.score === 'number') ? entry.score.toLocaleString() : 'N/A';
            let rankStr = `${rank}.`;

            let entryColor = color(HOVER_LEADERBOARD_TEXT_COLOR[0], HOVER_LEADERBOARD_TEXT_COLOR[1], HOVER_LEADERBOARD_TEXT_COLOR[2], finalTextAlpha);
            let applyBold = false;
            if (i === 0) { entryColor = color(HOVER_LEADERBOARD_GOLD_COLOR_LIGHT[0], HOVER_LEADERBOARD_GOLD_COLOR_LIGHT[1], HOVER_LEADERBOARD_GOLD_COLOR_LIGHT[2], finalTextAlpha); applyBold = true; }
            else if (i === 1) { entryColor = color(HOVER_LEADERBOARD_GOLD_COLOR_MEDIUM[0], HOVER_LEADERBOARD_GOLD_COLOR_MEDIUM[1], HOVER_LEADERBOARD_GOLD_COLOR_MEDIUM[2], finalTextAlpha); applyBold = true; }
            else if (i === 2) { entryColor = color(HOVER_LEADERBOARD_GOLD_COLOR_STRONG[0], HOVER_LEADERBOARD_GOLD_COLOR_STRONG[1], HOVER_LEADERBOARD_GOLD_COLOR_STRONG[2], finalTextAlpha); applyBold = true; }

            if (applyBold) { textStyle(BOLD); } else { textStyle(NORMAL); }
            fill(entryColor);

            textAlign(LEFT, TOP); text(rankStr, rankX, currentTextYDraw);
            textAlign(LEFT, TOP); text(nameStr, nameX, currentTextYDraw);
            textAlign(RIGHT, TOP); text(scoreStr, scoreAlignRightX, currentTextYDraw);

            currentTextYDraw += entryLineHeight;
        }
        textStyle(NORMAL);
    } else if (data) {
        fill(180, 180, 200, finalTextAlpha);
        textAlign(CENTER, TOP);
        text("Leaderboard Empty", currentBoxX + scaledBoxWidth / 2, currentTextYDraw);
    } else {
        fill(150, 150, 160, finalTextAlpha);
        textAlign(CENTER, TOP);
        text("No data", currentBoxX + scaledBoxWidth / 2, currentTextYDraw);
    }

    smooth();
    pop();

    pop();
}

// --- Updated: drawHoverDescription - Refined highlighting ---
function drawHoverDescription(button, description, animProgress, slideDirection = 'TOP', mode = null) {
    if (!button || animProgress <= 0) return;
    push();

    // --- Config ---
    const scaledPadding = HOVER_BOX_BASE_PADDING * currentScale;
    const scaledBoxWidth = HOVER_BOX_BASE_WIDTH * currentScale;
    const scaledTextSize = max(8, HOVER_BOX_BASE_TEXT_SIZE * currentScale);
    const lineHeight = scaledTextSize * 1.5;
    const scaledIconSize = HOVER_ANIM_ICON_BASE_SIZE * currentScale;
    const scaledIconSpacing = HOVER_ANIM_SPACING * currentScale;
    const iconAreaWidth = scaledIconSize + scaledIconSpacing;
    const scaledSubBulletExtraIndent = HOVER_SUB_BULLET_EXTRA_INDENT * currentScale;
    const scaledOffsetX = HOVER_BOX_OFFSET_X * currentScale;
    const scaledMaxGlow = NEON_GLOW_MAX_BLUR * currentScale;
    const targetBgAlpha = 240;
    const targetBorderAlpha = 200;
    const targetTextAlpha = 255;
    const scaledSlideMargin = SLIDE_OFFSCREEN_MARGIN * currentScale;

    // --- Text Wrapping & Height Calculation ---
    textFont(uiFont); textSize(scaledTextSize); textAlign(LEFT, TOP);
    let originalLines = description.split('\n');
    let lineObjects = [];
    let currentTextY = scaledPadding;
    let isInsideBulletParagraph = false;
    let currentBulletIndentOffset = 0;
    for (let lineIndex = 0; lineIndex < originalLines.length; lineIndex++) {
        let line = originalLines[lineIndex].trim();
        let isEmpty = line === '';
        let keywords = [];
        let isPowerupBulletLine = line.startsWith('Double Drop:') || line.startsWith('2x Multiplier:') || line.startsWith('Extra Ball:');
        let isPowerupHeaderLine = line.includes('Power Ups Chances :');
        let startsBullet = line.startsWith('Goal:') || line.startsWith('Start:') || line.startsWith('Bet:') || line.startsWith('Reward:') || line.startsWith('Scoring:') || line.startsWith('Danger:') || line.startsWith('End:') || line.startsWith('Race') || line.startsWith('Purity:') || isPowerupHeaderLine || isPowerupBulletLine || line.startsWith('Survival Mode:') || line.startsWith('High Score Mode:');

        if (isEmpty) {
            lineObjects.push({ text: '', y: currentTextY, contains: [], isBulletStart: false, isPowerupBullet: false, isPowerupHeader: false, indent: false, bulletIndentOffset: 0 });
            currentTextY += lineHeight * 0.5;
            isInsideBulletParagraph = false;
            currentBulletIndentOffset = 0;
            continue;
        }

        if (startsBullet) {
            isInsideBulletParagraph = true;
            currentBulletIndentOffset = isPowerupBulletLine ? scaledSubBulletExtraIndent : 0;
            if (line.includes('Goal:')) keywords.push('Goal');
            if (line.includes('Start:')) keywords.push('Start');
            if (line.includes('Bet:')) keywords.push('Bet');
            if (line.includes('Reward:')) keywords.push('Reward');
            if (line.includes('Scoring:')) keywords.push('Scoring');
            if (line.includes('Danger:')) keywords.push('Danger');
            if (line.includes('End:')) keywords.push('End');
            if (line.includes('Race')) keywords.push('Race');
            if (line.includes('Purity:')) keywords.push('Purity');
            if (isPowerupHeaderLine) keywords.push('Power-ups');
            if (isPowerupBulletLine && line.includes('Double Drop')) keywords.push('Double Drop');
            if (isPowerupBulletLine && line.includes('2x Multiplier')) keywords.push('2x Multiplier');
            if (isPowerupBulletLine && line.includes('Extra Ball')) keywords.push('Extra Ball');
        } else {
            if (!isInsideBulletParagraph) {
                currentBulletIndentOffset = 0;
            }
        }

        let words = line.split(' ');
        if (words.length === 0 || (words.length === 1 && words[0] === '')) {
            lineObjects.push({ text: '', y: currentTextY, contains: keywords, isBulletStart: startsBullet, isPowerupBullet: isPowerupBulletLine, isPowerupHeader: isPowerupHeaderLine, indent: false, bulletIndentOffset: currentBulletIndentOffset });
            currentTextY += lineHeight;
            continue;
        }

        let hasIconSpace = startsBullet && !line.startsWith('Survival Mode:') && !line.startsWith('High Score Mode:');
        let availableWidth = scaledBoxWidth - 2 * scaledPadding - currentBulletIndentOffset - (hasIconSpace ? iconAreaWidth : 0);
        let currentLineText = words[0];
        let isFirstLineOfThisChunk = true;

        for (let i = 1; i < words.length; i++) {
            let testLine = currentLineText + ' ' + words[i];
            let testWidth = textWidth(testLine);
            if (testWidth > availableWidth && currentLineText !== "") {
                let originalLineHadIcon = isFirstLineOfThisChunk && hasIconSpace;
                lineObjects.push({ text: currentLineText, y: currentTextY, contains: (isFirstLineOfThisChunk && startsBullet) ? keywords : [], isBulletStart: originalLineHadIcon, isPowerupBullet: isFirstLineOfThisChunk && isPowerupBulletLine, isPowerupHeader: isFirstLineOfThisChunk && isPowerupHeaderLine, indent: true, bulletIndentOffset: currentBulletIndentOffset });
                currentTextY += lineHeight;
                currentLineText = words[i];
                isFirstLineOfThisChunk = false;
                availableWidth = scaledBoxWidth - 2 * scaledPadding - currentBulletIndentOffset - (isInsideBulletParagraph ? iconAreaWidth : 0);
            } else {
                currentLineText = testLine;
            }
        }
        let originalLineHadIconLast = isFirstLineOfThisChunk && hasIconSpace;
        lineObjects.push({ text: currentLineText, y: currentTextY, contains: (isFirstLineOfThisChunk && startsBullet) ? keywords : [], isBulletStart: originalLineHadIconLast, isPowerupBullet: isFirstLineOfThisChunk && isPowerupBulletLine, isPowerupHeader: isFirstLineOfThisChunk && isPowerupHeaderLine, indent: !isFirstLineOfThisChunk, bulletIndentOffset: currentBulletIndentOffset });
        currentTextY += lineHeight;
    }
    const boxHeight = currentTextY - lineHeight + scaledPadding * 2;


    // --- Positioning & Animation ---
    const buttonPos = button.position(); const buttonSize = button.size(); const canvasOffsetX = (windowWidth - scaledCanvasWidth) / 2;

    let targetBoxX = buttonPos.x - canvasOffsetX - scaledBoxWidth - scaledOffsetX;
    targetBoxX = max(scaledPadding, targetBoxX);
    targetBoxX = min(targetBoxX, scaledCanvasWidth - scaledBoxWidth - scaledPadding);
    let currentBoxX = targetBoxX;

    let idealTargetBoxY = scaledCanvasHeight / 2 - boxHeight / 2;
    let targetBoxY = constrain(idealTargetBoxY, scaledPadding, scaledCanvasHeight - boxHeight - scaledPadding);

    let startBoxY;
    if (slideDirection === 'TOP') {
        startBoxY = -boxHeight - scaledSlideMargin;
    } else {
        startBoxY = scaledCanvasHeight + scaledSlideMargin;
    }

    const easedProgress = 1 - pow(1 - animProgress, 3);
    let currentBoxY = lerp(startBoxY, targetBoxY, easedProgress);

    let finalBgAlpha = targetBgAlpha * easedProgress;
    let finalBorderAlpha = targetBorderAlpha * easedProgress;
    let finalTextAlpha = targetTextAlpha * easedProgress;
    let finalGlowAmount = scaledMaxGlow * easedProgress;

    // --- Drawing Box ---
    fill(HOVER_BOX_BG_COLOR[0], HOVER_BOX_BG_COLOR[1], HOVER_BOX_BG_COLOR[2], finalBgAlpha);
    stroke(HOVER_BOX_BORDER_COLOR[0], HOVER_BOX_BORDER_COLOR[1], HOVER_BOX_BORDER_COLOR[2], finalBorderAlpha);
    strokeWeight(max(1, 1.5 * currentScale));
    rect(currentBoxX, currentBoxY, scaledBoxWidth, boxHeight, 4 * currentScale);

    // --- Drawing Content (Icons, Text, Highlights) ---
    push();
    noSmooth();

    noStroke();
    drawingContext.shadowBlur = finalGlowAmount;
    let glowColor = color(HOVER_BOX_TEXT_COLOR[0], HOVER_BOX_TEXT_COLOR[1], HOVER_BOX_TEXT_COLOR[2], (NEON_GLOW_COLOR_ALPHA / 255) * finalTextAlpha);
    drawingContext.shadowColor = glowColor.toString();

    let pulseAnim = (sin(frameCount * 0.1) + 1) / 2;
    let fastPulseAnim = (sin(frameCount * 0.2) + 1) / 2;
    let betSliderHighlightColor = lerpColor( color(HOVER_BOX_TEXT_COLOR[0], HOVER_BOX_TEXT_COLOR[1], HOVER_BOX_TEXT_COLOR[2], finalTextAlpha), color(neonYellow[0], neonYellow[1], neonYellow[2], finalTextAlpha), fastPulseAnim * 0.8 );

    for (let lineData of lineObjects) {
        if (lineData.text === '' && !lineData.isBulletStart && !lineData.isPowerupHeader) continue;
        let lineYDraw = currentBoxY + lineData.y;
        let lineBaseXDraw = currentBoxX + scaledPadding + lineData.bulletIndentOffset;
        let lineText = lineData.text;
        let textDrawX;
        let textDrawY = lineYDraw + (lineHeight - scaledTextSize) * 0.3;

        if (lineData.isBulletStart || lineData.isPowerupHeader) {
            let iconX = lineBaseXDraw;
            let iconY = lineYDraw;
            textDrawX = iconX + iconAreaWidth;
            let iconDrawn = false;

            if (mode === 'SURVIVAL') {
                if (lineData.contains.includes('Goal')) { drawTrophyIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Start')) { drawCoinIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Bet')) { drawSliderIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;} // Icon tied to 'Bet:' line
                else if (lineData.contains.includes('Reward')) { drawUpArrowIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Scoring')) { drawScoringIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Danger')) { drawClockIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('End')) { drawSkullIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Race')) { drawHourglassIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Power-ups')) { drawQuestionMarkIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Double Drop')) { drawDoubleDropIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('2x Multiplier')) { draw2xMultiplierIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Extra Ball')) { drawExtraBallPlusIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
            } else if (mode === 'HIGHSCORE') {
                 if (lineData.contains.includes('Start')) { drawCoinIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Bet')) { drawLockIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Goal')) { drawTrophyIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('End')) { drawBallIcon(iconX, iconY, scaledIconSize, finalTextAlpha, fastPulseAnim); iconDrawn = true;}
                else if (lineData.contains.includes('Purity')) { drawCrossedIcon(iconX, iconY, scaledIconSize, finalTextAlpha, pulseAnim, (x,y,s,a,p)=>drawStarIcon(x,y,s,a,p) ); iconDrawn = true;}
            }

            if (!iconDrawn) {
                textDrawX = lineBaseXDraw;
            }
        } else if (lineData.indent) {
            textDrawX = lineBaseXDraw + iconAreaWidth;
        } else {
            textDrawX = currentBoxX + scaledPadding;
        }

        // --- Draw Text ---
        fill(HOVER_BOX_TEXT_COLOR[0], HOVER_BOX_TEXT_COLOR[1], HOVER_BOX_TEXT_COLOR[2], finalTextAlpha);
        // <<< Updated highlighting logic >>>
        if (mode === 'SURVIVAL' && lineText.includes('"bet amount"')) { // Check for the core phrase
            let keyword = '"bet amount"'; // Highlight only this part
            let startIndex = lineText.indexOf(keyword);
            if (startIndex !== -1) {
                let prefix = lineText.substring(0, startIndex);
                let highlighted = lineText.substring(startIndex, startIndex + keyword.length);
                let suffix = lineText.substring(startIndex + keyword.length); // Includes " slider..." part
                let prefixWidth = textWidth(prefix);
                let highlightedWidth = textWidth(highlighted);
                text(prefix, textDrawX, textDrawY);
                fill(betSliderHighlightColor);
                text(highlighted, textDrawX + prefixWidth, textDrawY); // Draw highlighted keyword
                fill(HOVER_BOX_TEXT_COLOR[0], HOVER_BOX_TEXT_COLOR[1], HOVER_BOX_TEXT_COLOR[2], finalTextAlpha);
                text(suffix, textDrawX + prefixWidth + highlightedWidth, textDrawY); // Draw the rest normally
            } else {
                 text(lineText, textDrawX, textDrawY);
            }
        } else {
            text(lineText, textDrawX, textDrawY);
        }
    }

    // --- Draw Corner Animations ---
     let cornerAnimSize = scaledIconSize * 1.8;
     let cornerAnimX = currentBoxX + scaledBoxWidth - scaledPadding - cornerAnimSize;
     let cornerAnimY = currentBoxY + scaledPadding;
     let cornerAnimH = scaledIconSize * 1.5;
    if (mode === 'HIGHSCORE') { drawBallCountAnimation(cornerAnimX + cornerAnimSize, cornerAnimY, cornerAnimSize, finalTextAlpha); }
    else if (mode === 'SURVIVAL') { drawSurvivalCornerAnimation(cornerAnimX, cornerAnimY, cornerAnimSize, cornerAnimH * 1.5, finalTextAlpha); }

    drawingContext.shadowBlur = 0;
    smooth();
    pop();
    pop();
}

function drawPegs() { push(); const scaledPegRadius = basePegRadius * currentScale; const glowSize = scaledPegRadius * basePegGlowSizeIncrease; const scaledBaseShadowBlur = basePegShadowBlur * currentScale; noStroke(); for (let peg of pegs) { if (!Composite.get(world, peg.id, 'body')) continue; let currentRadius = scaledPegRadius; let currentShadowColor = 'rgba(180, 220, 255, 0.5)'; let currentShadowBlur = scaledBaseShadowBlur; let baseColor = color(255, 255, 255, 230); if (peg.plugin?.glowTimer > 0) { let glowProgress = map(peg.plugin.glowTimer, pegGlowDuration, 0, 1, 0); currentRadius = lerp(scaledPegRadius, glowSize, glowProgress); fill(255, 255, 255, lerp(230, 255, glowProgress)); currentShadowBlur = lerp(scaledBaseShadowBlur, max(10, 20 * currentScale), glowProgress); currentShadowColor = `rgba(255, 255, 255, ${lerp(0.5, 0.9, glowProgress)})`; peg.plugin.glowTimer--; } else { fill(baseColor); } drawingContext.shadowBlur = currentShadowBlur; drawingContext.shadowColor = currentShadowColor; ellipse(peg.position.x, peg.position.y, currentRadius * 2); drawingContext.shadowBlur = 0; } drawingContext.shadowBlur = 0; pop(); }
function drawBalls() { push(); const scaledBallRadius = currentBallRadius * currentScale; for (let i = balls.length - 1; i >= 0; i--) { let ball = balls[i]; if (!Composite.get(world, ball.id, 'body')) { console.warn(`Ball body ${ball.id} not found in world, removing from drawing array.`); balls.splice(i, 1); continue; } if (showTrails && ball.plugin?.path?.length > 1) { push(); noFill(); let ballColor = color(neonBlue[0], neonBlue[1], neonBlue[2]); let transparentColor = color(neonBlue[0], neonBlue[1], neonBlue[2], 0); for (let j = 1; j < ball.plugin.path.length; j++) { let segmentRatio = (j - 1) / (ball.plugin.path.length - 2 || 1); let currentAlpha = lerp(trailEndAlpha, trailStartAlpha, segmentRatio); let currentWeight = lerp(trailEndWeightFactor, trailStartWeightFactor, segmentRatio); currentWeight *= scaledBallRadius * 2; currentWeight = max(1, currentWeight); stroke(ballColor.levels[0], ballColor.levels[1], ballColor.levels[2], currentAlpha); strokeWeight(currentWeight); strokeCap(ROUND); line(ball.plugin.path[j - 1].x, ball.plugin.path[j - 1].y, ball.plugin.path[j].x, ball.plugin.path[j].y); } pop(); } let ballDrawColor = neonBlue; let glowColor = 'rgba(100, 220, 255, 0.7)'; push(); translate(ball.position.x, ball.position.y); rotate(ball.angle); fill(ballDrawColor[0], ballDrawColor[1], ballDrawColor[2]); noStroke(); drawingContext.shadowBlur = max(5, 15 * currentScale); drawingContext.shadowColor = glowColor; ellipse(0, 0, scaledBallRadius * 2); drawingContext.shadowBlur = 0; pop(); if (ball.position.y > scaledCanvasHeight + scaledBallRadius * 5 || ball.position.x < -scaledBallRadius * 5 || ball.position.x > gameAreaWidth + scaledBallRadius * 5) { if (DEBUG_MODE) console.log(`Removing off-screen ball ${ball.id}`); if (Composite.get(world, ball.id, 'body')) { World.remove(world, ball); } balls.splice(i, 1); } } pop(); }
function drawFunnels() { push(); if (!slotStartY || !dividers || dividers.length < numSlots + 1) { pop(); return; } const funnelTopActualY = slotStartY - 5 * currentScale; const scaledSlotHeight = baseSlotHeight * currentScale; stroke(funnelColor[0], funnelColor[1], funnelColor[2], funnelColor[3]); strokeWeight(max(1, 1.5 * currentScale)); for (let i = 1; i < dividers.length - 1; i++) { if (!dividers[i] || !dividers[i].position) continue; line(dividers[i].position.x, funnelTopActualY, dividers[i].position.x, slotStartY + scaledSlotHeight); } pop(); }
function drawMultiplierPanel() { push(); const panelX = multiplierPanelX; const panelY = multiplierPanelY; const panelW = multiplierPanelWidth; const panelH = multiplierPanelHeight; const itemH = multiplierPanelItemHeight; const itemS = multiplierPanelItemSpacing; const borderRadius = multiplierPanelBorderRadius; const txtSize = multiplierPanelTextSize; let hasVisibleHits = false; for (let i = 0; i < recentHits.length; i++) { let hit = recentHits[i]; let age = frameCount - hit.timestamp; if (age <= multiplierDisplayDuration) { hasVisibleHits = true; break; } } if (!hasVisibleHits) { for (let i = recentHits.length - 1; i >= 0; i--) { if (frameCount - recentHits[i].timestamp > multiplierDisplayDuration) { recentHits.splice(i, 1); } } pop(); return; } let currentY = panelY + itemS; const panelBottomBoundary = panelY + panelH - itemS; let maxItemsToShow = floor((panelH - itemS * 2) / (itemH + itemS)); maxItemsToShow = max(0, maxItemsToShow); let startIndex = max(0, recentHits.length - maxItemsToShow); for (let i = recentHits.length - 1; i >= startIndex; i--) { let hit = recentHits[i]; let age = frameCount - hit.timestamp; if (age > multiplierDisplayDuration) continue; let fadeProgress = age / multiplierDisplayDuration; let alpha = 255 * (1 - fadeProgress * fadeProgress); alpha = constrain(alpha, 0, 255); if (alpha > 5) { if (currentY + itemH > panelBottomBoundary) { break; } fill(multiplierDisplayOrange[0], multiplierDisplayOrange[1], multiplierDisplayOrange[2], alpha * 0.9); noStroke(); rect(panelX + itemS, currentY, panelW - 2 * itemS, itemH, borderRadius * 0.7); fill(255, 255, 255, alpha); textFont(uiFont); textSize(txtSize); textAlign(CENTER, CENTER); let multValue = hit.value; let decimals = (abs(multValue) < 1 && multValue !== 0) ? 1 : 0; let multText = nf(multValue, 0, decimals) + 'x'; text(multText, panelX + panelW / 2, currentY + itemH / 2 + (1 * currentScale)); currentY += (itemH + itemS); } } for (let i = recentHits.length - 1; i >= 0; i--) { if (frameCount - recentHits[i].timestamp > multiplierDisplayDuration) { recentHits.splice(i, 1); } } pop(); }
function drawPowerupTimer() { push(); if (!isDoubleDropActive && !isDoubleMultiplierActive) { pop(); return; } let maxTimeFrames = 0; if (isDoubleDropActive) maxTimeFrames = max(maxTimeFrames, doubleDropTimer); if (isDoubleMultiplierActive) maxTimeFrames = max(maxTimeFrames, doubleMultiplierTimer); let secondsLeft = ceil(maxTimeFrames / 60.0); if (secondsLeft <= 0) { pop(); return; } let powerupLabel = ""; if (isDoubleDropActive && isDoubleMultiplierActive) { powerupLabel = (doubleDropTimer > doubleMultiplierTimer) ? "Double Drop" : "2x Multiplier"; } else if (isDoubleDropActive) { powerupLabel = "Double Drop"; } else if (isDoubleMultiplierActive) { powerupLabel = "2x Multiplier"; } let timerText = `${powerupLabel}: ${secondsLeft}s`; let displayX = powerupTimerDisplayX; let displayY = powerupTimerDisplayY; let flickerColor = random(powerupTimerFlickerColors); textFont(uiFont); textSize(timerTextSize); textAlign(LEFT, TOP); let glowAmount = max(4, 12 * currentScale); drawingContext.shadowBlur = glowAmount; drawingContext.shadowColor = `rgba(${flickerColor[0]}, ${flickerColor[1]}, ${flickerColor[2]}, 0.7)`; fill(flickerColor); noStroke(); text(timerText, displayX, displayY); drawingContext.shadowBlur = 0; pop(); }
function drawSlots() { push(); const scaledSlotTextSize = slotTextSize; const scaledSlotHeight = baseSlotHeight * currentScale; let scaledBounceAmplitude = bounceAmplitude; textFont(slotFont); if (!dividers || dividers.length !== numSlots + 1) { pop(); return; } if (typeof slotStartY === 'undefined') { pop(); return; } for (let i = 0; i < numSlots; i++) { if (!dividers[i] || !dividers[i + 1] || !dividers[i].position || !dividers[i+1].position) { continue; } let dividerLeftX = dividers[i].position.x; let dividerRightX = dividers[i + 1].position.x; let slotCenterX = (dividerLeftX + dividerRightX) / 2; let currentSlotWidth = dividerRightX - dividerLeftX; if (currentSlotWidth <= 0) { currentSlotWidth = 1; } let slotX = slotCenterX - currentSlotWidth / 2; let slotY = slotStartY; let bounceOffsetY = 0; if (slotBounceState[i] > 0) { let bounceProgress = map(slotBounceState[i], bounceDuration, 0, 0, PI); bounceOffsetY = scaledBounceAmplitude * sin(bounceProgress); slotBounceState[i]--; } let baseMultiplier = slotMultipliers[i]; let colorFactor = map(Math.log10(baseMultiplier + 0.1), Math.log10(0.2 + 0.1), Math.log10(25 + 0.1), 0, 1); colorFactor = constrain(colorFactor, 0, 1); let slotColor; if (colorFactor < 0.5) { slotColor = lerpColor(color(255, 255, 0), color(255, 165, 0), map(colorFactor, 0, 0.5, 0, 1)); } else { slotColor = lerpColor(color(255, 165, 0), color(200, 0, 0), map(colorFactor, 0.5, 1, 0, 1)); } fill(slotColor); noStroke(); rect(slotX, slotY - bounceOffsetY, currentSlotWidth, scaledSlotHeight); if (slotGlowState[i] > 0) { let glowProgress = map(slotGlowState[i], slotGlowDuration, 0, 1, 0); let glowAlpha = map(pow(glowProgress, 0.5), 1, 0, slotGlowMaxAlpha, 0); fill(slotGlowColor[0], slotGlowColor[1], slotGlowColor[2], glowAlpha); noStroke(); rect(slotX, slotY - bounceOffsetY, currentSlotWidth, scaledSlotHeight); slotGlowState[i]--; } let brightnessValue = (red(slotColor) * 299 + green(slotColor) * 587 + blue(slotColor) * 114) / 1000; let textColor = brightnessValue > 125 ? color(0) : color(255); fill(textColor); textAlign(CENTER, CENTER); let currentMultiplier = baseMultiplier; if (currentGameMode === 'SURVIVAL' && isDoubleMultiplierActive) { currentMultiplier *= 2; } let multiplierText = nf(currentMultiplier, 0, (currentMultiplier < 1 && currentMultiplier !== 0) ? 1 : 0) + 'x'; let textY = (slotY + scaledSlotHeight / 2) - bounceOffsetY; textSize(scaledSlotTextSize); text(multiplierText, slotCenterX, textY); } pop(); }
function drawTitle() { push(); textFont(titleFont); textSize(titleSize); textAlign(CENTER, TOP); let titleText = "DROP"; let x = gameAreaWidth / 2; let y = titleY; let offset = titleSize * 0.03; fill(titleColorShadow[0], titleColorShadow[1], titleColorShadow[2], 180); text(titleText, x + offset, y + offset); let grad = drawingContext.createLinearGradient(x - titleSize, y, x + titleSize, y + titleSize); grad.addColorStop(0, `rgb(${titleColorHighlight[0]}, ${titleColorHighlight[1]}, ${titleColorHighlight[2]})`); grad.addColorStop(0.5, `rgb(${titleColorBase[0]}, ${titleColorBase[1]}, ${titleColorBase[2]})`); grad.addColorStop(1, `rgb(${titleColorShadow[0]}, ${titleColorShadow[1]}, ${titleColorShadow[2]})`); drawingContext.fillStyle = grad; text(titleText, x, y); fill(titleColorHighlight[0], titleColorHighlight[1], titleColorHighlight[2], 100); text(titleText, x - offset * 0.5, y - offset * 0.5); pop(); }
function drawLaunchTitle(alpha) { if (alpha <= 0) return; push(); let launchTitleSize = titleSize * 2.0; textFont(titleFont); textSize(launchTitleSize); textAlign(CENTER, CENTER); let titleText = "DROP"; let x = scaledCanvasWidth / 2; let y = scaledCanvasHeight * 0.3; let baseOffset = launchTitleSize * 0.035; let numLayers = 5; let liquidSpeed = 0.03; let liquidShiftAmount = launchTitleSize * 0.1; let highlightShift = sin(frameCount * liquidSpeed) * liquidShiftAmount; for (let i = numLayers; i >= 1; i--) { let layerOffset = baseOffset * i; let layerAlphaMultiplier = pow((numLayers - i) / numLayers, 1.5); let shadowIntensity = map(i, 1, numLayers, 0.5, 0.9); fill( titleColorShadow[0] * shadowIntensity, titleColorShadow[1] * shadowIntensity, titleColorShadow[2] * shadowIntensity, 190 * layerAlphaMultiplier * (alpha / 255) ); text(titleText, x + layerOffset, y + layerOffset); } let grad = drawingContext.createLinearGradient( x - launchTitleSize * 0.6 + highlightShift, y - launchTitleSize * 0.4, x + launchTitleSize * 0.6 + highlightShift, y + launchTitleSize * 0.4 ); let hRGBA = `rgba(${titleColorHighlight[0]}, ${titleColorHighlight[1]}, ${titleColorHighlight[2]}, ${0.9 * alpha / 255})`; let bRGBA = `rgba(${titleColorBase[0]}, ${titleColorBase[1]}, ${titleColorBase[2]}, ${1.0 * alpha / 255})`; let mSR = lerp(titleColorShadow[0], titleColorBase[0], 0.4); let mSG = lerp(titleColorShadow[1], titleColorBase[1], 0.4); let mSB = lerp(titleColorShadow[2], titleColorBase[2], 0.4); let mSRGBA = `rgba(${mSR}, ${mSG}, ${mSB}, ${1.0 * alpha / 255})`; let sRGBA = `rgba(${titleColorShadow[0]}, ${titleColorShadow[1]}, ${titleColorShadow[2]}, ${0.8 * alpha / 255})`; grad.addColorStop(0, hRGBA); grad.addColorStop(0.4, bRGBA); grad.addColorStop(0.8, mSRGBA); grad.addColorStop(1, sRGBA); drawingContext.fillStyle = grad; text(titleText, x, y); let glowBlur = max(5, 25 * currentScale) * (alpha / 255); let glowColor = `rgba(${titleColorHighlight[0]}, ${titleColorHighlight[1]}, ${titleColorHighlight[2]}, ${0.5 * (alpha / 255)})`; drawingContext.shadowBlur = glowBlur; drawingContext.shadowColor = glowColor; drawingContext.fillStyle = grad; text(titleText, x, y); drawingContext.shadowBlur = 0; drawingContext.shadowColor = 'rgba(0,0,0,0)'; pop(); }
function drawEnhancedUIText(txt, x, y, size, fillColor = color(230), align = LEFT) { push(); textFont(uiFont); textSize(size); textAlign(align, TOP); fill(uiTextOutlineColor[0], uiTextOutlineColor[1], uiTextOutlineColor[2], uiTextOutlineColor[3]); let outlineOffset = max(1, 1.5 * currentScale); text(txt, x + outlineOffset, y + outlineOffset); drawingContext.shadowBlur = 0; fill(fillColor); text(txt, x, y); pop(); }
function drawGameUI() { push(); textFont(uiFont); fill(230, 230, 240, 220); textAlign(LEFT, TOP); let textX = uiSideMargin; let goldTextY = scoreY; let scoreColor = color(230, 230, 240, 220); if (currentGameMode === 'SURVIVAL' && goldLossFlashActive) { let flashProgress = (goldLossFlashEndFrame - frameCount) / pointsLossFlashDurationFrames; let flashSin = sin(flashProgress * PI); scoreColor = lerpColor(color(230, 230, 240, 220), color(brightRed[0], brightRed[1], brightRed[2]), flashSin); } let goldText = `Gold: ${floor(score)}`; drawEnhancedUIText(goldText, textX, goldTextY, uiScoreTextSize, scoreColor, LEFT); let rightSideTopY = scoreY - uiScoreTextSize - (3 * currentScale); let rightSideBottomY = scoreY; if (currentGameMode === 'HIGHSCORE') { let highScorePointsText = `Total points earned: ${highScorePoints}`; drawEnhancedUIText(highScorePointsText, gameAreaWidth - uiSideMargin, rightSideTopY, uiScoreTextSize, color(230), RIGHT); let ballsLeftText = `Balls Left: ${ballsRemaining}`; drawEnhancedUIText(ballsLeftText, gameAreaWidth - uiSideMargin, rightSideBottomY, uiScoreTextSize, color(230), RIGHT); } else if (currentGameMode === 'SURVIVAL') { let survivalPointsText = `Total Points Earned: ${sessionScore}`; drawEnhancedUIText(survivalPointsText, gameAreaWidth - uiSideMargin, rightSideBottomY, uiScoreTextSize, color(230), RIGHT); } if (currentGameMode === 'SURVIVAL') { let decayTextY = goldTextY + uiScoreTextSize + (5 * currentScale); let decayInfoText = ""; let showLossText = true; let now = millis(); let timeToNext = nextDecayTime - now; let secsToNext = ceil(max(0, timeToNext) / 1000); let percent = (currentDecayPercent * 100).toFixed(0); decayInfoText = `Gold Loss: ${percent}% (Next: ${secsToNext}s)`; if (isGoldLossCountdownActive || goldLossMessageActive) { showLossText = false; } if (showLossText && nextDecayTime !== Infinity) { let decayTextSize = uiScoreTextSize * 0.85; let decayTextColor = color(200, 200, 200, 220); drawEnhancedUIText(decayInfoText, uiSideMargin, decayTextY, decayTextSize, decayTextColor, LEFT); } } let dropBtnX = uiSideMargin; let dropBtnY = dropButtonY; let dropBtnW = buttonWidth; let dropBtnH = buttonHeight; let dropButtonTextSize = max(7, baseButtonTextSize * currentScale * 1.3); let canDrop = false; let dropLabel = ""; if (currentGameMode === 'SURVIVAL') { let totalDropCost = betAmount; canDrop = (score >= totalDropCost); dropLabel = `Drop (Cost: ${totalDropCost})`; } else if (currentGameMode === 'HIGHSCORE') { canDrop = (ballsRemaining > 0); dropLabel = `Drop Ball (${ballsRemaining} left)`; } drawNeonButton( dropLabel, dropBtnX, dropBtnY, dropBtnW, dropBtnH, neonBlue, 0, uiFont, dropButtonTextSize, canDrop && gameState === 'PLAYING' ); pop(); }
function drawGameOverOverlay() { push(); fill(0, 0, 0, 190); rect(0, 0, gameAreaWidth, scaledCanvasHeight); textFont(titleFont); textAlign(CENTER, CENTER); if (gameOverState === 'SHOWING_FORM') { let message = ""; let messageSize = max(26, 52 * currentScale); let messageY = scaledCanvasHeight * 0.35; let messageColor = color(220, 220, 220); if (currentGameMode === 'SURVIVAL') { message = "Game Over"; messageColor = color(trueRed[0], trueRed[1], trueRed[2]); let sessionScoreY = messageY + messageSize * 0.7; let sessionScoreSize = messageSize * 0.6; textSize(sessionScoreSize); fill(220, 220, 180); drawingContext.shadowBlur = max(4, 12 * currentScale); drawingContext.shadowColor = 'rgba(220, 220, 180, 0.6)'; text(`Total Points: ${sessionScore}`, gameAreaWidth / 2, sessionScoreY); drawingContext.shadowBlur = 0; } else if (currentGameMode === 'HIGHSCORE') { message = `TOTAL POINTS: ${highScorePoints}`; messageColor = color(neonGreen[0], neonGreen[1], neonGreen[2]); } textSize(messageSize); drawingContext.shadowBlur = max(8, 18 * currentScale); drawingContext.shadowColor = messageColor.toString(); fill(messageColor); text(message, gameAreaWidth / 2, messageY); drawingContext.shadowBlur = 0; const form = document.getElementById('leaderboard-form'); if (form && form.style.display !== 'none') { positionLeaderboardForm(form); } } else if (gameOverState === 'SHOWING_LEADERBOARD') { let titleY = leaderboardYOffset; textSize(leaderboardTitleSize); fill(220, 200, 255); drawingContext.shadowBlur = max(5, 15 * currentScale); drawingContext.shadowColor = 'rgba(220, 200, 255, 0.5)'; text("Leaderboard", gameAreaWidth / 2, titleY); drawingContext.shadowBlur = 0; drawLeaderboard(); let btnW = buttonWidth * gameOverButtonWidthScale; let btnH = buttonHeight * gameOverButtonHeightScale; let btnX = gameAreaWidth / 2 - btnW / 2; let spacing = gameOverButtonSpacing * currentScale; let btnFontSize = max(10, baseButtonTextSize * currentScale * 1.6); let menuBtnY = scaledCanvasHeight - spacing * 1.5 - btnH; let restartBtnY = menuBtnY - spacing - btnH; drawNeonButton("Restart", btnX, restartBtnY, btnW, btnH, gameOverButtonColor, 0, uiFont, btnFontSize); drawNeonButton("Menu", btnX, menuBtnY, btnW, btnH, gameOverButtonColor, 0, uiFont, btnFontSize); } pop(); }
function drawLeaderboard() { push(); textFont(uiFont); textSize(leaderboardTextSize); textAlign(LEFT, TOP); let startY = leaderboardYOffset + leaderboardTitleSize + 20 * currentScale; let lineH = (leaderboardTextSize + leaderboardEntrySpacing) * 1.3; const maxRankStr = "10."; const maxNameStr = "WWWWWWWWWW"; const maxScoreStr = "9,999,999"; const rankColWidth = textWidth(maxRankStr) + 5 * currentScale; const nameColWidth = textWidth(maxNameStr) + 15 * currentScale; const scoreColWidth = textWidth(maxScoreStr) + 5 * currentScale; const totalContentWidth = rankColWidth + nameColWidth + scoreColWidth; const leaderboardCenterX = gameAreaWidth / 2; const blockStartX = leaderboardCenterX - totalContentWidth / 2; const rankColumnX = blockStartX; const nameColumnX = rankColumnX + rankColWidth; const scoreColumnAlignX = nameColumnX + nameColWidth + scoreColWidth; const strongGold = color(255, 190, 0); const mediumGold = color(255, 215, 0); const lightGold = color(255, 235, 100); const defaultColor = color(210, 210, 230); if (leaderboardLoading) { textAlign(CENTER, TOP); fill(200); textStyle(NORMAL); text("Loading Leaderboard...", leaderboardCenterX, startY); } else if (leaderboardError) { textAlign(CENTER, TOP); fill(softRed[0], softRed[1], softRed[2]); textStyle(NORMAL); text(`Error: ${leaderboardError}`, leaderboardCenterX, startY); text("Could not load leaderboard.", leaderboardCenterX, startY + lineH); } else if (leaderboardData && leaderboardData.length > 0) { let bottomButtonAreaY = scaledCanvasHeight - (buttonHeight * gameOverButtonHeightScale * 2 + gameOverButtonSpacing * currentScale * 3); let availableHeight = bottomButtonAreaY - startY; let maxVisibleEntries = floor(availableHeight / lineH); maxVisibleEntries = max(0, maxVisibleEntries); for (let i = 0; i < min(leaderboardData.length, maxVisibleEntries); i++) { let entry = leaderboardData[i]; let rank = i + 1; let nameStr = (entry.player_name || 'ANONYMOUS').toUpperCase().substring(0, 10); let scoreStr = (typeof entry.score === 'number') ? entry.score.toLocaleString() : 'N/A'; let rankStr = `${rank}.`; let entryColor = defaultColor; let applyBold = false; if (i === 0) { entryColor = lightGold; applyBold = true; } else if (i === 1) { entryColor = mediumGold; applyBold = true; } else if (i === 2) { entryColor = strongGold; applyBold = true; } if (applyBold) { textStyle(BOLD); } else { textStyle(NORMAL); } fill(entryColor); let currentY = startY + i * lineH; textAlign(LEFT, TOP); text(rankStr, rankColumnX, currentY); textAlign(LEFT, TOP); text(nameStr, nameColumnX, currentY); textAlign(RIGHT, TOP); text(scoreStr, scoreColumnAlignX, currentY); } textStyle(NORMAL); if (leaderboardData.length > maxVisibleEntries) { fill(180); textAlign(CENTER, TOP); text("...", leaderboardCenterX, startY + maxVisibleEntries * lineH); } } else if (leaderboardData) { fill(180); textAlign(CENTER, TOP); textStyle(NORMAL); text("Leaderboard is empty.", leaderboardCenterX, startY); } else { fill(150); textAlign(CENTER, TOP); textStyle(NORMAL); text("No leaderboard data.", leaderboardCenterX, startY); } pop(); }
function drawNeonButton(label, x, y, w, h, baseColor, cost = 0, font = uiFont, fontSize = 15, enabled = true) { push(); noStroke(); translate(x, y); let cornerRadius = h * 0.3; let gradColorLight, gradColorDark, glowColor, textColor; let isDisabled = !enabled; if (isDisabled) { gradColorLight = color(80, 80, 90, 200); gradColorDark = color(50, 50, 60, 200); glowColor = color(0, 0, 0, 0); textColor = color(140, 140, 150); } else { gradColorLight = color(baseColor[0], baseColor[1], baseColor[2], 255); gradColorDark = color(baseColor[0] * 0.6, baseColor[1] * 0.6, baseColor[2] * 0.6, 255); glowColor = color(baseColor[0], baseColor[1], baseColor[2], 180); textColor = color(255); } if (enabled) { drawingContext.shadowBlur = max(6, 22 * currentScale); drawingContext.shadowColor = glowColor.toString(); } else { drawingContext.shadowBlur = 0; } let grad = drawingContext.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, gradColorLight.toString()); grad.addColorStop(1, gradColorDark.toString()); drawingContext.fillStyle = grad; rect(0, 0, w, h, cornerRadius); drawingContext.shadowBlur = 0; fill(textColor); textFont(font); textSize(fontSize); textAlign(CENTER, CENTER); text(label, w / 2, h / 2 + max(1, 1.5 * currentScale)); pop(); }
function drawSlider(slider) { if (!slider) return; push(); let sliderXRelative = slider.x; let trackY = slider.y + 25 * currentScale; let scaledFontSize = max(8, 12 * currentScale); let isDisabled = slider.enabled !== undefined && !slider.enabled; let labelColor = isDisabled ? color(120) : color(220); let trackColor = isDisabled ? color(80) : color(120); let handleColor = isDisabled ? color(100) : neonYellow; let handleGlow = isDisabled ? 'rgba(100, 100, 100, 0)' : 'rgba(255, 255, 0, 0.7)'; let valueColor = isDisabled ? color(120) : color(220); fill(labelColor); textFont(uiFont); textSize(scaledFontSize); textAlign(CENTER, BOTTOM); text(slider.label, sliderXRelative + sliderWidth / 2, trackY - 6 * currentScale); stroke(trackColor); strokeWeight(max(2, 4 * currentScale)); line(sliderXRelative, trackY, sliderXRelative + sliderWidth, trackY); let handleXRelative = map(slider.value, slider.minVal, slider.maxVal, sliderXRelative, sliderXRelative + sliderWidth); handleXRelative = constrain(handleXRelative, sliderXRelative, sliderXRelative + sliderWidth); noStroke(); fill(handleColor); if (!isDisabled) { drawingContext.shadowBlur = max(4, 10 * currentScale); drawingContext.shadowColor = handleGlow; } ellipse(handleXRelative, trackY, sliderHandleSize, sliderHandleSize); drawingContext.shadowBlur = 0; fill(valueColor); textFont(uiFont); textSize(scaledFontSize); textAlign(CENTER, TOP); let valueText = ""; if (slider === musicVolumeSlider) { valueText = floor(slider.value); } else if (slider === speedSlider) { valueText = slider.value.toFixed(1) + 'x'; } else if (slider === sfxVolumeSlider) { valueText = slider.value.toFixed(2); } else { valueText = floor(slider.value); } text(valueText, sliderXRelative + sliderWidth / 2, trackY + 8 * currentScale); pop(); }
function drawStatisticsBars() { push(); const chartHeightMax = max(40, 80 * currentScale); const chartWidth = max(90, 180 * currentScale); const chartX = gameAreaWidth - chartWidth - max(5, 10 * currentScale); const chartY = max(40, 80 * currentScale); let maxHitCount = 0; for (let count of slotHitCounts) { if (count > maxHitCount) { maxHitCount = count; } } if (maxHitCount === 0) { stroke(100); strokeWeight(max(1, 1 * currentScale)); line(chartX, chartY + chartHeightMax, chartX + chartWidth, chartY + chartHeightMax); noStroke(); pop(); return; } const barWidth = chartWidth / numSlots; translate(chartX, chartY); for (let i = 0; i < numSlots; i++) { let count = slotHitCounts[i]; let barH = map(count, 0, maxHitCount, 0, chartHeightMax); let barX = i * barWidth; let baseMultiplier = slotMultipliers[i]; let colorFactor = map(Math.log10(baseMultiplier + 0.1), Math.log10(0.2 + 0.1), Math.log10(25 + 0.1), 0, 1); colorFactor = constrain(colorFactor, 0, 1); let barColor = colorFactor < 0.5 ? lerpColor(color(255, 255, 0, 200), color(255, 165, 0, 200), map(colorFactor, 0, 0.5, 0, 1)) : lerpColor(color(255, 165, 0, 200), color(200, 0, 0, 200), map(colorFactor, 0.5, 1, 0, 1)); let currentBarColor = barColor; if (histogramBarPulseState[i] > 0) { let pulseProgress = map(histogramBarPulseState[i], histogramPulseDuration, 0, 1, 0); let pulseBrightness = lerp(1.0, 1.8, pulseProgress * pulseProgress); currentBarColor = color( min(255, red(barColor) * pulseBrightness), min(255, green(barColor) * pulseBrightness), min(255, blue(barColor) * pulseBrightness), alpha(barColor) ); histogramBarPulseState[i]--; } fill(currentBarColor); noStroke(); rect(barX, chartHeightMax - barH, barWidth - max(1, 1 * currentScale), barH); } stroke(150); strokeWeight(max(1, 1 * currentScale)); line(0, chartHeightMax, chartWidth, chartHeightMax); noStroke(); pop(); }
function drawMarker() { if (gameState !== 'PLAYING' || markerX === undefined || markerY === undefined) return; push(); fill(markerColor); noStroke(); ellipse(markerX, markerY, markerSize * 1.2, markerSize * 1.2); pop(); }


// ============================ Body Creation Functions ============================
function createPegs() { pegs.forEach(peg => { if (Composite.get(world, peg.id, 'body')) { World.remove(world, peg); } }); pegs = []; lastRowPegPositionsX = []; topRowOuterPegsX = []; lastPegRowY = 0; let scaledPegRadius = basePegRadius * currentScale; let scaledPegSpacing = basePegSpacing * currentScale; let scaledStartY = baseStartYPegs * currentScale; const options = { isStatic: true, restitution: pegRestitution, friction: pegFriction, label: 'peg', plugin: { glowTimer: 0 } }; for (let row = 0; row < pegRowsTotal; row++) { let pegsInRow = row + 3; let y = scaledStartY + row * scaledPegSpacing * 0.95; let totalWidth = (pegsInRow - 1) * scaledPegSpacing; let startX = (gameAreaWidth - totalWidth) / 2; if (y > lastPegRowY) { lastPegRowY = y; } let isLastRow = (row === pegRowsTotal - 1); let isFirstRow = (row === 0); for (let col = 0; col < pegsInRow; col++) { let x = startX + col * scaledPegSpacing; let peg = Bodies.circle(x, y, scaledPegRadius, options); World.add(world, peg); pegs.push(peg); if (isLastRow) { lastRowPegPositionsX.push(x); } if (isFirstRow) { if (col === 0) topRowOuterPegsX[0] = x; if (col === pegsInRow - 1) topRowOuterPegsX[1] = x; } } } if (topRowOuterPegsX.length === 2) { markerMinX = topRowOuterPegsX[0]; markerMaxX = topRowOuterPegsX[1]; if (markerX === undefined || markerX < markerMinX || markerX > markerMaxX) { markerX = markerMinX; } markerY = scaledStartY - 30 * currentScale; markerSpeed = baseMarkerSpeed * currentScale; markerSize = baseMarkerSize * currentScale; } else { console.error("Could not find outermost top pegs for marker! Using fallback bounds."); markerMinX = gameAreaWidth * 0.1; markerMaxX = gameAreaWidth * 0.9; markerX = markerMinX; markerY = scaledStartY - 30 * currentScale; } if (lastRowPegPositionsX.length !== numSlots + 1) { console.warn(`Peg position warning: Expected ${numSlots + 1} bottom peg X positions for dividers, found ${lastRowPegPositionsX?.length}. Dividers might be slightly misaligned.`); } }
function createSlotsAndDividers() { dividers.forEach(div => { if (Composite.get(world, div.id, 'body')) { World.remove(world, div); } }); slotSensors.forEach(sen => { if (Composite.get(world, sen.id, 'body')) { World.remove(world, sen); } }); dividers = []; slotSensors = []; let scaledSlotHeight = baseSlotHeight * currentScale; let scaledDividerWidth = max(1, baseDividerWidth * currentScale); if (typeof slotStartY === 'undefined') { console.error("slotStartY undefined in createSlotsAndDividers. Cannot create slots."); return; } let dividerXPositions = []; if (lastRowPegPositionsX && lastRowPegPositionsX.length === numSlots + 1) { dividerXPositions = lastRowPegPositionsX; } else { console.error(`Incorrect number of peg positions for dividers: Expected ${numSlots + 1}, found ${lastRowPegPositionsX?.length}. Using approximated positions.`); const approxSlotWidth = gameAreaWidth * 0.8 / numSlots; const startDivX = gameAreaWidth * 0.1; for (let i = 0; i <= numSlots; i++) { dividerXPositions.push(startDivX + i * approxSlotWidth); } } const sensorOptions = { isStatic: true, isSensor: true, label: '' }; const dividerOptions = { isStatic: true, restitution: dividerRestitution, friction: dividerFriction, label: 'divider' }; const dividerHeight = scaledSlotHeight + 5 * currentScale; const dividerY = slotStartY + scaledSlotHeight / 2; let currentDividers = []; for (let i = 0; i < dividerXPositions.length; i++) { let dividerX = dividerXPositions[i]; let divider = Bodies.rectangle(dividerX, dividerY, scaledDividerWidth, dividerHeight, dividerOptions); currentDividers.push(divider); } dividers = currentDividers; World.add(world, dividers); const sensorY = slotStartY + scaledSlotHeight / 2; for (let i = 0; i < numSlots; i++) { if (!dividers[i] || !dividers[i + 1]) { console.error(`Missing divider for slot sensor ${i}`); continue; } let dividerLeftX = dividers[i].position.x; let dividerRightX = dividers[i + 1].position.x; let slotCenterX = (dividerLeftX + dividerRightX) / 2; let sensorSlotWidth = dividerRightX - dividerLeftX; if (sensorSlotWidth <= 0) { sensorSlotWidth = 1; } let currentSensorOptions = { ...sensorOptions, label: `slot_${i}` }; let sensor = Bodies.rectangle(slotCenterX, sensorY, sensorSlotWidth, scaledSlotHeight, currentSensorOptions); World.add(world, sensor); slotSensors.push(sensor); } }
function createBoundaries() { boundaries.forEach(body => { if (Composite.get(world, body.id, 'body')) { World.remove(world, body); } }); boundaries = []; const wallOptions = { isStatic: true, isSensor: true, label: 'wall' }; const groundOptions = { isStatic: true, restitution: groundRestitution, friction: groundFriction, label: 'ground' }; const wallThickness = max(5, 20 * currentScale); if (typeof slotStartY === 'undefined') { console.error("Cannot create boundaries: slotStartY is undefined."); return; } let scaledSlotHeight = baseSlotHeight * currentScale; const groundY = slotStartY + scaledSlotHeight + wallThickness / 2 - max(1, 1 * currentScale); let leftmostX = wallThickness / 2; let rightmostX = gameAreaWidth - wallThickness / 2; if (dividers.length > 0 && dividers[0].position && dividers[dividers.length - 1].position) { const firstDividerX = dividers[0].position.x; const lastDividerX = dividers[dividers.length - 1].position.x; const scaledDividerWidth = max(1, baseDividerWidth * currentScale); const wallPadding = (basePegSpacing * 1.0) * currentScale; leftmostX = Math.max(wallThickness / 2, firstDividerX - wallPadding - scaledDividerWidth / 2); rightmostX = Math.min(gameAreaWidth - wallThickness / 2, lastDividerX + wallPadding + scaledDividerWidth / 2); } else { console.warn("No dividers found for precise boundary calculation. Using default bounds."); } let leftWall = Bodies.rectangle(leftmostX, scaledCanvasHeight / 2, wallThickness, scaledCanvasHeight * 1.5, wallOptions); let rightWall = Bodies.rectangle(rightmostX, scaledCanvasHeight / 2, wallThickness, scaledCanvasHeight * 1.5, wallOptions); let groundWidth = rightmostX - leftmostX + wallThickness; let groundCenterX = (leftmostX + rightmostX) / 2; let ground = Bodies.rectangle(groundCenterX, groundY, groundWidth, wallThickness, groundOptions); World.add(world, [leftWall, rightWall, ground]); boundaries.push(leftWall, rightWall, ground); }
function createPhysicsBall(x, y) { const scaledBallRadius = currentBallRadius * currentScale; const ballColor = neonBlue; const label = 'ball_regular'; const options = { restitution: ballRestitution, friction: 0.05, frictionAir: ballFrictionAir, density: ballDensity, label: label, isStatic: false, plugin: { type: 'regular', hitWall: false, path: [] }, render: { fillStyle: `rgb(${ballColor[0]}, ${ballColor[1]}, ${ballColor[2]})` } }; let ball = Bodies.circle(x, y, scaledBallRadius, options); Body.setVelocity(ball, { x: Common.random(-0.1, 0.1) * currentScale, y: 0 }); World.add(world, ball); balls.push(ball); }

// ============================ Collision & Scoring ============================
function handleCollisions(event) { let pairs = event.pairs; for (let i = 0; i < pairs.length; i++) { let pair = pairs[i]; if (!pair || !pair.isActive || !pair.collision) continue; let bodyA = pair.bodyA; let bodyB = pair.bodyB; let ball = null, sensor = null, ground = null, wall = null, peg = null, divider = null; if (bodyA.label === 'ball_regular') ball = bodyA; else if (bodyB.label === 'ball_regular') ball = bodyB; if (bodyA.label.startsWith('slot_')) sensor = bodyA; else if (bodyB.label.startsWith('slot_')) sensor = bodyB; if (bodyA.label === 'ground') ground = bodyA; else if (bodyB.label === 'ground') ground = bodyB; if (bodyA.label === 'wall') wall = bodyA; else if (bodyB.label === 'wall') wall = bodyB; if (bodyA.label === 'peg') peg = bodyA; else if (bodyB.label === 'peg') peg = bodyB; if (bodyA.label === 'divider') divider = bodyA; else if (bodyB.label === 'divider') divider = bodyB; if (ball && sensor) { if (!Composite.get(world, ball.id, 'body')) continue; let hitSlotIndex = parseInt(sensor.label.split('_')[1]); if (hitSlotIndex >= 0 && hitSlotIndex < numSlots) { let sensorBody = slotSensors[hitSlotIndex]; if (!sensorBody) { console.warn(`Collision: Could not find sensor body for index ${hitSlotIndex}`); continue; } let slotCenterX = sensorBody.position.x; let slotCenterY = sensorBody.position.y; let slotWidth = sensorBody.bounds.max.x - sensorBody.bounds.min.x; slotHitCounts[hitSlotIndex]++; histogramBarPulseState[hitSlotIndex] = histogramPulseDuration; slotBounceState[hitSlotIndex] = bounceDuration; slotGlowState[hitSlotIndex] = slotGlowDuration; createParticleBurst(slotCenterX, slotCenterY); createRippleEffect(slotCenterX, slotCenterY, slotWidth); createBackgroundRipple(slotCenterX, slotCenterY); let baseMultiplierValue = slotMultipliers[hitSlotIndex]; let finalMultiplier = baseMultiplierValue; let amountWon = 0; if (currentGameMode === 'SURVIVAL') { if (isDoubleMultiplierActive) finalMultiplier *= 2; amountWon = betAmount * finalMultiplier; } else if (currentGameMode === 'HIGHSCORE') { finalMultiplier = baseMultiplierValue; amountWon = finalMultiplier * 10; } let amountToAdd = floor(amountWon); if (currentGameMode === 'SURVIVAL') { sessionScore += amountToAdd; score += amountToAdd; } else if (currentGameMode === 'HIGHSCORE') { highScorePoints += amountToAdd; } recentHits.push({ value: finalMultiplier, timestamp: frameCount }); if (recentHits.length > maxMultiplierHistory) { recentHits.shift(); } if (blopSound && blopSound.isLoaded()) { blopSound.play(); } if (Composite.get(world, ball.id, 'body')) { World.remove(world, ball); } for (let j = balls.length - 1; j >= 0; j--) { if (balls[j].id === ball.id) { balls.splice(j, 1); break; } } } else { console.warn(`Invalid slot index ${hitSlotIndex} from sensor ${sensor.label}. Removing ball.`); if (Composite.get(world, ball.id, 'body')) { World.remove(world, ball); } for (let j = balls.length - 1; j >= 0; j--) { if (balls[j].id === ball.id) { balls.splice(j, 1); break; } } } } else if (ball && peg) { if (peg.plugin) { peg.plugin.glowTimer = pegGlowDuration; } if (pair.collision.normal) { let forceDirection = Matter.Vector.sub(ball.position, peg.position); forceDirection = Matter.Vector.normalise(forceDirection); forceDirection = Matter.Vector.mult(forceDirection, horizontalKickStrength); forceDirection.y *= 0.1; Body.applyForce(ball, ball.position, forceDirection); } createBackgroundRipple(peg.position.x, peg.position.y); } else if (ball && wall) { if (Composite.get(world, ball.id, 'body')) { World.remove(world, ball); } for (let j = balls.length - 1; j >= 0; j--) { if (balls[j].id === ball.id) { balls.splice(j, 1); break; } } } else if (ball && (ground || divider)) { /* Physics handles bounce */ } } }

// ============================ Event Handlers & Other Logic ============================
function showLeaderboardForm(finalScore, mode) {
    const form = document.getElementById('leaderboard-form');
    const scoreInput = document.getElementById('score');
    const modeInput = document.getElementById('game-mode');
    const nameInput = document.getElementById('player-name');
    const submitButton = form ? form.querySelector('button[type="submit"]') : null;
    if (form && scoreInput && modeInput && nameInput && submitButton) {
        scoreInput.value = Math.floor(finalScore);
        modeInput.value = mode;
        nameInput.value = '';
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Score';
        form.style.display = 'block';
        positionLeaderboardForm(form);
        setTimeout(() => { nameInput.focus(); }, 50);
    } else {
        console.error("Could not find all leaderboard form elements! Skipping form display.");
        leaderboardError = "Leaderboard form unavailable.";
        gameOverState = 'SHOWING_LEADERBOARD';
        fetchLeaderboardData('endgame', currentGameMode);
    }
}

function positionLeaderboardForm(formElement) {
    if (!formElement || !canvas || !canvas.elt) {
        console.warn("Cannot position form: Missing form or canvas element.");
        return;
     }
    const canvasRect = canvas.elt.getBoundingClientRect();
    let messageYCanvas = scaledCanvasHeight * 0.35;
    let messageSize = max(26, 52 * currentScale);
    let textBottomEdgeCanvas = messageYCanvas + messageSize * 0.6;
    let paddingBelowText = 20 * currentScale;
    let formWidth = formElement.offsetWidth || parseFloat(formElement.style.maxWidth) || 260;
    let gameAreaCenterXOnPage = canvasRect.left + (gameAreaWidth / 2);
    let formLeftPage = gameAreaCenterXOnPage - (formWidth / 2);
    let formTopPage = canvasRect.top + textBottomEdgeCanvas + paddingBelowText;
    formLeftPage = Math.max(formLeftPage, 5);
    formTopPage = Math.max(formTopPage, canvasRect.top + 5);
    formLeftPage = Math.min(formLeftPage, windowWidth - formWidth - 5);
    formTopPage = Math.min(formTopPage, windowHeight - formElement.offsetHeight - 5);
    formElement.style.left = `${formLeftPage}px`;
    formElement.style.top = `${formTopPage}px`;
}

function hideLeaderboardForm() {
    const form = document.getElementById('leaderboard-form');
    if (form) { form.style.display = 'none'; }
}

function handleScoreSubmittedSuccessfully() {
    console.log("handleScoreSubmittedSuccessfully called in sketch.");
    if (gameState !== 'GAME_OVER') {
        console.warn("handleScoreSubmittedSuccessfully called but gameState is not GAME_OVER.");
    }
    if (gameOverState !== 'SHOWING_FORM') {
        console.warn("handleScoreSubmittedSuccessfully called but gameOverState is not SHOWING_FORM.");
    }
    hideLeaderboardForm();
    gameOverState = 'SHOWING_LEADERBOARD';
    fetchLeaderboardData('endgame', currentGameMode);
}

async function fetchLeaderboardData(context, mode) {
    if (!mode) {
        console.error("fetchLeaderboardData called without a mode!");
        return;
    }
    if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
         console.error("Supabase client (window.supabaseClient) not available in sketch.js!");
         if (context === 'hover') {
             if (mode === 'survival') survivalLeaderboardError = "DB connection failed.";
             else highScoreLeaderboardError = "DB connection failed.";
         } else {
             leaderboardError = "Database connection failed.";
         }
         return;
    }

    let isLoading;
    if (context === 'hover') {
        if (mode === 'survival') { isLoading = survivalLeaderboardLoading; }
        else { isLoading = highScoreLeaderboardLoading; }
    } else {
        isLoading = leaderboardLoading;
    }

    if (context === 'hover') {
        if (mode === 'survival') { survivalLeaderboardLoading = true; survivalLeaderboardData = null; survivalLeaderboardError = null; }
        else { highScoreLeaderboardLoading = true; highScoreLeaderboardData = null; highScoreLeaderboardError = null; }
    } else {
        leaderboardLoading = true; leaderboardData = null; leaderboardError = null;
    }

    let tableName = mode === 'survival' ? 'survival_leaderboard' : 'high_score_leaderboard';
    console.log(`Fetching ${context} leaderboard data from ${tableName}...`);

    try {
        const { data, error } = await window.supabaseClient
            .from(tableName)
            .select('player_name, score')
            .order('score', { ascending: false })
            .limit(leaderboardMaxEntries);

        if (error) {
            console.error(`Error fetching ${context} leaderboard (${mode}):`, error);
            if (context === 'hover') {
                if (mode === 'survival') survivalLeaderboardError = error.message;
                else highScoreLeaderboardError = error.message;
            } else {
                leaderboardError = error.message;
            }
        } else {
            console.log(`${context} leaderboard data (${mode}) received:`, data);
            if (context === 'hover') {
                 if (mode === 'survival') survivalLeaderboardData = data;
                 else highScoreLeaderboardData = data;
            } else {
                 leaderboardData = data;
            }
        }
    } catch (e) {
        console.error(`Exception during Supabase fetch for ${context} (${mode}):`, e);
        let errorMsg = "A critical error occurred fetching scores.";
        if (context === 'hover') {
             if (mode === 'survival') survivalLeaderboardError = errorMsg;
             else highScoreLeaderboardError = errorMsg;
        } else {
             leaderboardError = errorMsg;
        }
    } finally {
        if (context === 'hover') {
            if (mode === 'survival') survivalLeaderboardLoading = false;
            else highScoreLeaderboardLoading = false;
        } else {
            leaderboardLoading = false;
        }
    }
}

function fetchAllLeaderboards() {
    console.log("Fetching both leaderboards for hover display...");
    fetchLeaderboardData('hover', 'survival');
    fetchLeaderboardData('hover', 'highscore');
}


// --- Audio & Input Functions ---
function firstInteraction() {
    if (!audioStarted) {
        console.log("Audio Context starting trigger...");
        let audioContext = getAudioContext();
        if (!audioContext) {
            console.error("AudioContext not supported by this browser.");
            audioStarted = true;
            return;
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log("Audio Context Resumed successfully.");
                startAudioPlayback();
            }).catch(e => console.error("Error resuming audio context:", e));
        } else {
            console.log("Audio Context state:", audioContext.state);
            startAudioPlayback();
        }
    }
 }

 function startAudioPlayback() {
    if (!audioStarted) {
        audioStarted = true;
        console.log("Audio systems initialized.");
        let currentSfxVol = sfxVolumeSlider ? sfxVolumeSlider.value : defaultSfxVolume;
        if (blopSound?.isLoaded()) blopSound.setVolume(currentSfxVol);
        if (bonusSound?.isLoaded()) bonusSound.setVolume(currentSfxVol);
        if (backgroundMusic?.isLoaded()) {
            backgroundMusic.setVolume(musicVolume);
            if (musicVolume > 0.01 && !backgroundMusic.isPlaying()) {
                try {
                    backgroundMusic.loop();
                    console.log("Background music loop started.");
                } catch (e) {
                    console.error("Error directly calling backgroundMusic.loop():", e);
                }
            }
        } else {
             console.log("Background music not loaded yet when startAudioPlayback called.");
        }
    }
 }

function mousePressed() {
    if (transitionState !== 'NONE') return;
    firstInteraction();

    if (gameState === 'GAME_OVER') {
        const formElement = document.getElementById('leaderboard-form');
        const isFormVisible = formElement && formElement.style.display !== 'none';

        if (isFormVisible) {
             let formRect = formElement.getBoundingClientRect();
             let mouseWindowX = mouseX + (windowWidth - scaledCanvasWidth) / 2;
             let mouseWindowY = mouseY + (windowHeight - scaledCanvasHeight) / 2;
             if (mouseWindowX >= formRect.left && mouseWindowX <= formRect.right &&
                 mouseWindowY >= formRect.top && mouseWindowY <= formRect.bottom) {
                return;
            }
        }

        if (gameOverState === 'SHOWING_LEADERBOARD') {
            let btnW = buttonWidth * gameOverButtonWidthScale; let btnH = buttonHeight * gameOverButtonHeightScale;
            let btnX = gameAreaWidth / 2 - btnW / 2; let spacing = gameOverButtonSpacing * currentScale;
            let menuBtnY = scaledCanvasHeight - spacing * 1.5 - btnH; let restartBtnY = menuBtnY - spacing - btnH;
            let mouseCanvasX = mouseX;
            let mouseCanvasY = mouseY;

            if (mouseCanvasX >= 0 && mouseCanvasX <= gameAreaWidth && mouseCanvasY >= 0 && mouseCanvasY <= scaledCanvasHeight) {
                if (mouseCanvasX > btnX && mouseCanvasX < btnX + btnW && mouseCanvasY > restartBtnY && mouseCanvasY < restartBtnY + btnH) {
                    hideLeaderboardForm(); startTransition('PLAYING', prepareGameForMode); return;
                }
                if (mouseCanvasX > btnX && mouseCanvasX < btnX + btnW && mouseCanvasY > menuBtnY && mouseCanvasY < menuBtnY + btnH) {
                    hideLeaderboardForm(); startTransition('LAUNCH_MENU', returnToLaunchMenuCleanup); return;
                }
            }
        }
        if (isFormVisible) return;

    } else if (gameState === 'PLAYING') {
         if (mouseX >= menuStartX && mouseX < scaledCanvasWidth) { // Settings Panel
            if (speedSlider && speedSlider.enabled && checkSliderInteraction(speedSlider, 'press')) return;
            if (betSlider && betSlider.enabled && checkSliderInteraction(betSlider, 'press')) return;
            if (ballSizeSlider && ballSizeSlider.enabled && checkSliderInteraction(ballSizeSlider, 'press')) return;
            if (sfxVolumeSlider && sfxVolumeSlider.enabled && checkSliderInteraction(sfxVolumeSlider, 'press')) return;
            if (musicVolumeSlider && musicVolumeSlider.enabled && checkSliderInteraction(musicVolumeSlider, 'press')) return;

            let mouseXRelative = mouseX - menuStartX; let mouseYRelative = mouseY;
            let lastSliderBottomY = 60 * currentScale;
            let sliderToCheck = [musicVolumeSlider, sfxVolumeSlider, ballSizeSlider, betSlider, speedSlider];
            for(let slider of sliderToCheck) { if (slider && typeof slider.y === 'number') { lastSliderBottomY = slider.y + max(60*currentScale, baseSliderOriginSpacing * currentScale); break; } }
            let buttonStartY = lastSliderBottomY;
            let buttonSpacing = buttonHeight + max(10*currentScale, 15 * currentScale);
            let buttonX = (menuWidth - buttonWidth) / 2; let currentButtonY = buttonStartY;
            let settingsButtonTextSize = max(7, baseButtonTextSize * currentScale * 1.3);
            if (mouseXRelative > buttonX && mouseXRelative < buttonX + buttonWidth && mouseYRelative > currentButtonY && mouseYRelative < currentButtonY + buttonHeight) { showTrails = !showTrails; return; }
            currentButtonY += buttonSpacing;
            if (mouseXRelative > buttonX && mouseXRelative < buttonX + buttonWidth && mouseYRelative > currentButtonY && mouseYRelative < currentButtonY + buttonHeight) { showAnalyzer = !showAnalyzer; return; }
            currentButtonY += buttonSpacing;
            if (mouseXRelative > buttonX && mouseXRelative < buttonX + buttonWidth && mouseYRelative > currentButtonY && mouseYRelative < currentButtonY + buttonHeight) { startTransition('LAUNCH_MENU', returnToLaunchMenuCleanup); return; }
        } else if (mouseX < gameAreaWidth) { // Game Area Drop Button Click
            let dropBtnX = uiSideMargin; let dropBtnY = dropButtonY;
            let dropBtnW = buttonWidth; let dropBtnH = buttonHeight;
            if (mouseX > dropBtnX && mouseX < dropBtnX + dropBtnW && mouseY > dropBtnY && mouseY < dropBtnY + dropBtnH) {
                let canDrop = (currentGameMode === 'SURVIVAL' && score >= betAmount) || (currentGameMode === 'HIGHSCORE' && ballsRemaining > 0);
                if (canDrop) {
                    handleDrop();
                 }
                 return;
            }
        }
    }
}

function mouseDragged() {
     if (transitionState !== 'NONE') return;
     if (gameState === 'PLAYING' && mouseX >= menuStartX) {
         if (speedSlider && speedSlider.enabled) checkSliderInteraction(speedSlider, 'drag');
         if (betSlider && betSlider.enabled) checkSliderInteraction(betSlider, 'drag');
         if (ballSizeSlider && ballSizeSlider.enabled) checkSliderInteraction(ballSizeSlider, 'drag');
         if (sfxVolumeSlider && sfxVolumeSlider.enabled) checkSliderInteraction(sfxVolumeSlider, 'drag');
         if (musicVolumeSlider && musicVolumeSlider.enabled) checkSliderInteraction(musicVolumeSlider, 'drag');
     }
}

function mouseReleased() {
     checkSliderInteraction(speedSlider, 'release');
     checkSliderInteraction(betSlider, 'release');
     checkSliderInteraction(ballSizeSlider, 'release');
     checkSliderInteraction(sfxVolumeSlider, 'release');
     checkSliderInteraction(musicVolumeSlider, 'release');
}

function keyPressed() {
    if (keyCode === 32 || key === ' ') {
        if (gameState === 'PLAYING') {
            let canDrop = (currentGameMode === 'SURVIVAL' && score >= betAmount) || (currentGameMode === 'HIGHSCORE' && ballsRemaining > 0);
            if (canDrop) {
                handleDrop();
                return false;
            }
        }
    }

    if (gameState === 'PLAYING' && currentGameMode === 'SURVIVAL') {
        if (keyIsDown(SHIFT) && keyIsDown(CONTROL) && (key === 's' || key === 'S')) {
             if (speedSlider) {
                 speedSlider.enabled = !speedSlider.enabled;
                 console.log(`ADMIN: Speed Slider Lock Toggled: ${speedSlider.enabled ? 'OFF (Enabled)' : 'ON (Disabled)'}`);
                 return false;
             }
        }
         if (keyIsDown(SHIFT) && keyIsDown(CONTROL) && (key === 'g' || key === 'G')) {
             score += ADMIN_ADD_GOLD_AMOUNT;
             console.log(`ADMIN: Added ${ADMIN_ADD_GOLD_AMOUNT} gold. New total: ${floor(score)}`);
             return false;
         }
    }
}

function checkSliderInteraction(slider, eventType) {
     if (!slider) return false;

     if (eventType !== 'release' && slider.enabled !== undefined && !slider.enabled) {
         return false;
     }

     let sliderXRelativeInPanel = slider.x;
     let trackStartXAbsolute = menuStartX + sliderXRelativeInPanel;
     let trackEndXAbsolute = trackStartXAbsolute + sliderWidth;
     let trackYAbsolute = slider.y + 25 * currentScale;
     let handleXAbsolute = map(slider.value, slider.minVal, slider.maxVal, trackStartXAbsolute, trackEndXAbsolute);
     handleXAbsolute = constrain(handleXAbsolute, trackStartXAbsolute, trackEndXAbsolute);

     let mouseXCanvas = mouseX;
     let mouseYCanvas = mouseY;

     let clickAreaTop = slider.y;
     let clickAreaBottom = slider.y + 50 * currentScale;
     let clickAreaLeft = trackStartXAbsolute - sliderHandleSize;
     let clickAreaRight = trackEndXAbsolute + sliderHandleSize;

     let interactionOccurred = false;

     if (eventType === 'press') {
         if (slider.enabled && mouseXCanvas >= menuStartX && mouseXCanvas < scaledCanvasWidth &&
             mouseYCanvas >= clickAreaTop && mouseYCanvas <= clickAreaBottom)
         {
             let distToHandle = dist(mouseXCanvas, mouseYCanvas, handleXAbsolute, trackYAbsolute);
             let isOnTrack = (mouseXCanvas >= trackStartXAbsolute && mouseXCanvas <= trackEndXAbsolute && abs(mouseYCanvas - trackYAbsolute) < sliderHandleSize * 1.5);

             if (distToHandle < sliderHandleSize * 1.5 || isOnTrack) {
                 slider.dragging = true;
                 let mouseXRelativeToTrack = mouseXCanvas - trackStartXAbsolute;
                 let newValue = map(mouseXRelativeToTrack, 0, sliderWidth, slider.minVal, slider.maxVal);
                 newValue = constrain(newValue, slider.minVal, slider.maxVal);
                 updateSliderValue(slider, newValue);
                 interactionOccurred = true;
             }
         }
     } else if (eventType === 'drag') {
         if (slider.dragging) {
             if (slider.enabled) {
                let mouseXRelativeToTrack = mouseXCanvas - trackStartXAbsolute;
                let newValue = map(mouseXRelativeToTrack, 0, sliderWidth, slider.minVal, slider.maxVal);
                newValue = constrain(newValue, slider.minVal, slider.maxVal);
                updateSliderValue(slider, newValue);
             } else {
                 slider.dragging = false;
             }
             interactionOccurred = true;
         }
     } else if (eventType === 'release') {
         if (slider.dragging) {
             interactionOccurred = true;
         }
         slider.dragging = false;
     }

     return interactionOccurred;
}

function updateSliderValue(slider, newValue) { if (slider === speedSlider) { slider.value = newValue; gravityScale = map(slider.value, minSpeedSliderDisplayValue, maxSpeedSliderDisplayValue, minActualGravity, maxActualGravity); if (engine) engine.world.gravity.y = gravityScale; } else if (slider === betSlider) { slider.value = floor(newValue); betAmount = slider.value; } else if (slider === ballSizeSlider) { slider.value = floor(newValue); currentBallRadius = slider.value; } else if (slider === sfxVolumeSlider) { slider.value = newValue; sfxVolume = slider.value; if (blopSound?.isLoaded()) blopSound.setVolume(sfxVolume); if (bonusSound?.isLoaded()) bonusSound.setVolume(sfxVolume); } else if (slider === musicVolumeSlider) { slider.value = floor(newValue); let actualVolume = map(slider.value, 0, 100, 0.0, 1.0); musicVolume = actualVolume; if (backgroundMusic?.isLoaded()) { backgroundMusic.setVolume(actualVolume); if (actualVolume > 0.01 && !backgroundMusic.isPlaying() && audioStarted) { backgroundMusic.loop(); } else if (actualVolume <= 0.01 && backgroundMusic.isPlaying()) { backgroundMusic.stop(); } } } }

function activateDoubleDrop() { if (currentGameMode !== 'SURVIVAL' || isDoubleDropActive) return; isDoubleDropActive = true; doubleDropTimer = doubleDropDuration; doubleDropMessage = "DOUBLE DROP!"; doubleDropMessageTimer = powerupMessageDuration; if (bonusSound?.isLoaded()) { bonusSound.play(); } }
function activateDoubleMultiplier() { if (currentGameMode !== 'SURVIVAL' || isDoubleMultiplierActive) return; isDoubleMultiplierActive = true; doubleMultiplierTimer = doubleMultiplierDuration; doubleMultiplierMessage = "2x MULTIPLIER!"; doubleMultiplierMessageTimer = powerupMessageDuration; if (bonusSound?.isLoaded()) { bonusSound.play(); } }

function handleDrop() {
    if (gameState !== 'PLAYING' || transitionState !== 'NONE') return;

    if (currentGameMode === 'SURVIVAL') {
        let cost = betAmount;
        if (score >= cost) {
            score -= cost;

            let startX = markerX + random(-1 * currentScale, 1 * currentScale);
            let startY = markerY;

            createPhysicsBall(startX, startY);

            if (isNextDropBonus) {
                isNextDropBonus = false;
                 setTimeout(() => {
                    if (gameState !== 'PLAYING' || currentGameMode !== 'SURVIVAL') return;
                    let bonusStartX = startX + random(-2 * currentScale, 2 * currentScale);
                    let bonusStartY = startY;
                    createPhysicsBall(bonusStartX, bonusStartY);
                    if (DEBUG_MODE) console.log("Bonus Drop triggered!");
                }, dropDelay / 3);
            }
            else if (isDoubleDropActive) {
                setTimeout(() => {
                    if (gameState !== 'PLAYING' || currentGameMode !== 'SURVIVAL') return;
                    let extraStartX = startX + random(-1 * currentScale, 1 * currentScale);
                    let extraStartY = startY;
                    createPhysicsBall(extraStartX, extraStartY);
                    if (DEBUG_MODE) console.log("Double Drop powerup dropped second ball.");
                }, dropDelay / 3);
            }

            let betRange = maxBetAmount - minBetAmount;
            let betRatio = (betRange > 0) ? constrain((betAmount - minBetAmount) / betRange, 0, 1) : 0;
            let oddsMultiplier = 1 + powerupBetScalingFactor * betRatio;

            if (!isNextDropBonus && random() < bonusBallChance) {
                isNextDropBonus = true;
                bonusBallMessage = "NEXT DROP DOUBLED!";
                bonusBallTimer = bonusBallDuration;
                 if (DEBUG_MODE) console.log("Next Drop Bonus Activated!");
                if (bonusSound && bonusSound.isLoaded()) { bonusSound.play(); }
            }

            if (!isDoubleDropActive && random() < doubleDropChance * oddsMultiplier) {
                activateDoubleDrop();
            }
            if (!isDoubleMultiplierActive && random() < doubleMultiplierChance * oddsMultiplier) {
                activateDoubleMultiplier();
            }

        } else {
            if (DEBUG_MODE) console.log("Drop prevented: Insufficient gold (final check).");
        }
    } else if (currentGameMode === 'HIGHSCORE') {
        if (ballsRemaining > 0) {
            ballsRemaining--;
            score -= highScoreBallCost;
            score = max(0, score);
            let startX = markerX + random(-1 * currentScale, 1 * currentScale);
            let startY = markerY;
            createPhysicsBall(startX, startY);
        } else {
            if (DEBUG_MODE) console.log("Drop prevented: Out of balls (final check).");
        }
    }
}


function handleSurvivalDecay() {
    if (gameState !== 'PLAYING' || currentGameMode !== 'SURVIVAL') return;
    let now = millis();
    let timeToNext = nextDecayTime - now;
    if (timeToNext <= pointsLossWarningStartTime * 1000 && timeToNext > 0 && !isGoldLossCountdownActive && !goldLossMessageActive) {
        isGoldLossCountdownActive = true; goldLossCountdownValue = pointsLossWarningStartTime; goldLossCountdownAnimProgress = 0;
        if(DEBUG_MODE) console.log("Starting gold loss countdown...");
    }
    if (now >= nextDecayTime) {
        let decayAmount = floor(score * currentDecayPercent);
        goldLostAmountForDisplay = decayAmount;
        if (score > 0 && decayAmount > 0) {
            score -= decayAmount;
            if (DEBUG_MODE) console.log(`Gold Loss Applied: -${decayAmount} gold (${(currentDecayPercent * 100).toFixed(0)}%) | New Gold: ${floor(score)}`);
            goldLossFlashActive = true; goldLossFlashEndFrame = frameCount + pointsLossFlashDurationFrames;
            isGoldLossCountdownActive = false; goldLossMessageActive = true; goldLossMessageProgress = 0;
        } else {
            if (DEBUG_MODE && decayAmount <= 0) console.log(`Gold Loss skipped: Decay amount was ${decayAmount}`);
            isGoldLossCountdownActive = false; goldLossMessageActive = false;
        }
        currentDecayPercent = min(survivalMaxDecayPercent, currentDecayPercent + survivalDecayIncrement);
        lastDecayTime = now;
        nextDecayTime = now + survivalDecayInterval;
        if (currentDecayPercent >= survivalMaxDecayPercent) {
            if (DEBUG_MODE) console.log(`DECAY GAMEOVER: Reached ${currentDecayPercent * 100}% decay.`);
            isGameOverConditionMet = true;
            isGameOverFromDecay = true;
        }
         if (score < minBetAmount && balls.length === 0) {
             isGameOverConditionMet = true;
         } else if (score <= 0 && balls.length === 0) {
             isGameOverConditionMet = true;
         }
    }
}

function updateGoldLossVisuals() {
    if (!isGoldLossCountdownActive && !goldLossMessageActive) return;
    let now = millis();
    if (isGoldLossCountdownActive) {
        let timeToNext = nextDecayTime - now;
        let secsToNextExact = max(0, timeToNext / 1000.0);
        let newCountdownValue = ceil(secsToNextExact);
        if (newCountdownValue <= 0) {
            isGoldLossCountdownActive = false; goldLossCountdownValue = 0;
        } else {
            goldLossCountdownValue = newCountdownValue;
            goldLossCountdownAnimProgress = 1.0 - (secsToNextExact - floor(secsToNextExact));
            goldLossCountdownAnimProgress = constrain(goldLossCountdownAnimProgress, 0, 1);
        }
    } else if (goldLossMessageActive) {
        goldLossMessageProgress += 1 / lossMessageDuration;
        goldLossMessageProgress = min(goldLossMessageProgress, 1);
        if (goldLossMessageProgress >= 1) {
            goldLossMessageActive = false;
        }
    }
}
function drawGoldLossVisuals() {
    if (!isGoldLossCountdownActive && !goldLossMessageActive) return;
    push();
    textFont(titleFont); textAlign(CENTER, CENTER); rectMode(CENTER);
    if (isGoldLossCountdownActive && goldLossCountdownValue > 0) {
        let percent = (currentDecayPercent * 100).toFixed(0);
        let countdownText = `Losing ${percent}% of gold\nin ${goldLossCountdownValue} seconds`;
        let baseSize = lossCountdownTextSizeBase * currentScale;
        let easeInOut = 0.5 - 0.5 * cos(goldLossCountdownAnimProgress * PI);
        let currentScaleFactor = lerp(1.0, lossCountdownPulseScale, easeInOut);
        let currentAlpha = lerp(150, 255, easeInOut);
        let currentColor = lerpColor(color(greyishPurpleBase), color(greyishPurpleHighlight), easeInOut);
        drawingContext.shadowBlur = max(6, 18 * currentScale) * easeInOut;
        drawingContext.shadowColor = `rgba(${greyishPurpleHighlight[0]}, ${greyishPurpleHighlight[1]}, ${greyishPurpleHighlight[2]}, 0.7)`;
        fill(currentColor.levels[0], currentColor.levels[1], currentColor.levels[2], currentAlpha);
        textSize(baseSize * currentScaleFactor);
        text(countdownText, gameAreaWidth / 2, scaledCanvasHeight / 2);
        drawingContext.shadowBlur = 0;
    } else if (goldLossMessageActive) {
        let messageText = `-${goldLostAmountForDisplay} Gold`;
        let baseSize = lossMessageTextSizeBase * currentScale;
        let easeOutQuint = (x) => 1 - pow(1 - x, 5);
        let progressEasedScale = easeOutQuint(goldLossMessageProgress);
        let progressEasedAlpha = goldLossMessageProgress * goldLossMessageProgress;
        let currentScaleFactor = lerp(lossMessageStartScale, 1.0, progressEasedScale);
        let currentAlpha = lerp(255, 0, progressEasedAlpha);
        let glowAmount = lerp(lossMessageGlowBlur * currentScale, 0, progressEasedAlpha);
        fill(neonRed[0], neonRed[1], neonRed[2], currentAlpha);
        drawingContext.shadowBlur = glowAmount;
        drawingContext.shadowColor = `rgba(${neonRed[0]}, ${neonRed[1]}, ${neonRed[2]}, 0.7)`;
        textSize(baseSize * currentScaleFactor);
        text(messageText, gameAreaWidth / 2, scaledCanvasHeight / 2);
        drawingContext.shadowBlur = 0;
    }
    pop();
}

function handlePowerupTimersAndVisuals() {
    push();
    let time = millis() / 1000.0;
    noStroke();
    let scaledBonusTextSize = max(20, 40 * currentScale);
    let scaledPowerupTextSize = scaledBonusTextSize * 0.9;
    let bonusY = scaledCanvasHeight / 2 - 100 * currentScale;
    let powerupOffsetY = scaledBonusTextSize * 1.2;
    let scaledShadowBlur = max(5, 15 * currentScale);
    textFont(titleFont);
    textAlign(CENTER, CENTER);

    if (bonusBallTimer > 0) {
        bonusBallTimer--;
        let alpha = map(bonusBallTimer, 0, bonusBallDuration, 0, 255);
        fill(bonusColor[0], bonusColor[1], bonusColor[2], alpha);
        textSize(scaledBonusTextSize);
        drawingContext.shadowBlur = scaledShadowBlur;
        drawingContext.shadowColor = `rgba(${bonusColor[0]},${bonusColor[1]},${bonusColor[2]},${alpha / 255 * 0.7})`;
        text(bonusBallMessage, gameAreaWidth / 2, bonusY);
        drawingContext.shadowBlur = 0;
         if (bonusBallTimer <= 0) {
             bonusBallMessage = '';
         }
    }

    let ddY = bonusY + powerupOffsetY;
    if (doubleDropMessageTimer > 0) {
        doubleDropMessageTimer--;
        let alpha = map(doubleDropMessageTimer, 0, powerupMessageDuration, 0, 255);
        fill(neonBlue[0], neonBlue[1], neonBlue[2], alpha);
        textSize(scaledPowerupTextSize);
        drawingContext.shadowBlur = scaledShadowBlur;
        drawingContext.shadowColor = `rgba(${neonBlue[0]},${neonBlue[1]},${neonBlue[2]},${alpha / 255 * 0.7})`;
        text(doubleDropMessage, gameAreaWidth / 2, ddY);
        drawingContext.shadowBlur = 0;
        if (doubleDropMessageTimer <= 0) doubleDropMessage = '';
    }

    let dmY = bonusY + powerupOffsetY * ((doubleDropMessageTimer > 0 || bonusBallTimer > 0) ? 2 : 1);
     if (doubleMultiplierMessageTimer > 0) {
        doubleMultiplierMessageTimer--;
        let alpha = map(doubleMultiplierMessageTimer, 0, powerupMessageDuration, 0, 255);
        fill(neonYellow[0], neonYellow[1], neonYellow[2], alpha);
        textSize(scaledPowerupTextSize);
        drawingContext.shadowBlur = scaledShadowBlur;
        drawingContext.shadowColor = `rgba(${neonYellow[0]},${neonYellow[1]},${neonYellow[2]},${alpha / 255 * 0.7})`;
        text(doubleMultiplierMessage, gameAreaWidth / 2, dmY);
        drawingContext.shadowBlur = 0;
        if (doubleMultiplierMessageTimer <= 0) doubleMultiplierMessage = '';
    }

    if (isDoubleDropActive && doubleDropTimer > 0) {
        doubleDropTimer--;
        if (doubleDropTimer <= 0) isDoubleDropActive = false;
    }
    if (isDoubleMultiplierActive && doubleMultiplierTimer > 0) {
        doubleMultiplierTimer--;
        if (doubleMultiplierTimer <= 0) isDoubleMultiplierActive = false;
    }

    let scaledThicknessMin = max(1, 3 * currentScale);
    let scaledThicknessMax = max(3, 8 * currentScale);
    let scaledInset = 10 * currentScale;
    let scaledRectBorderRadius = max(2, 5 * currentScale);

    if (isDoubleDropActive) {
        let pulse = (sin(time * 8) + 1) / 2;
        let thickness = map(pulse, 0, 1, scaledThicknessMin, scaledThicknessMax);
        let borderCol = lerpColor(color(neonBlue[0], neonBlue[1], neonBlue[2]), color(trueRed[0], trueRed[1], trueRed[2]), pulse);
        stroke(borderCol); strokeWeight(thickness); noFill();
        rect(thickness / 2, thickness / 2, gameAreaWidth - thickness, scaledCanvasHeight - thickness, scaledRectBorderRadius);
    }

    if (isDoubleMultiplierActive) {
        let inset = isDoubleDropActive ? scaledInset : 0;
        let pulse = (sin(time * 6 + PI / 2) + 1) / 2;
        let thickness = map(pulse, 0, 1, scaledThicknessMin, scaledThicknessMax);
        stroke(neonYellow[0], neonYellow[1], neonYellow[2], map(pulse, 0, 1, 150, 255));
        strokeWeight(thickness); noFill();
        rect(thickness / 2 + inset, thickness / 2 + inset, gameAreaWidth - thickness - inset * 2, scaledCanvasHeight - thickness - inset * 2, scaledRectBorderRadius);
    }

    noStroke();
    pop();
}

// --- Game State Management ---
function returnToLaunchMenuCleanup() {
    currentGameMode = null;
    let bodiesToRemove = Composite.allBodies(world).filter(body => body.label === 'ball_regular');
    bodiesToRemove.forEach(body => { if (Composite.get(world, body.id, 'body')) World.remove(world, body); });
    balls = []; activeParticles = []; activeRipples = []; backgroundRipples = []; recentHits = [];
    pegs.forEach(peg => { if (peg.plugin) peg.plugin.glowTimer = 0; });
    for (let i = 0; i < numSlots; i++) { slotBounceState[i] = 0; slotGlowState[i] = 0; histogramBarPulseState[i] = 0; slotHitCounts[i] = 0; }
    isGameOverConditionMet = false; highScoreEnded = false; goldLossFlashActive = false;
    isGameOverFromDecay = false;
    isDoubleDropActive = false; doubleDropTimer = 0; doubleDropMessageTimer = 0;
    isDoubleMultiplierActive = false; doubleMultiplierTimer = 0; doubleMultiplierMessageTimer = 0;
    isNextDropBonus = false; bonusBallTimer = 0; bonusBallMessage = '';
    isGoldLossCountdownActive = false; goldLossMessageActive = false;
    goldLostAmountForDisplay = 0; highScorePoints = 0; sessionScore = 0; score = 0;
    gameOverState = 'NONE';
    leaderboardData = null; leaderboardLoading = false; leaderboardError = null;
    hideLeaderboardForm();
    if (speedSlider) speedSlider.enabled = true;
    if (betSlider) betSlider.enabled = true;
    if (ballSizeSlider) ballSizeSlider.enabled = true;

    isHoveringSurvival = false;
    isHoveringHighScore = false;
    survivalHoverAnimProgress = 0;
    highScoreHoverAnimProgress = 0;
    survivalLeaderboardAnimProgress = 0;
    highScoreLeaderboardAnimProgress = 0;
    fetchAllLeaderboards();
}

function resetGame() {
    let bodiesToRemove = Composite.allBodies(world).filter(body => !body.isStatic && body.label === 'ball_regular');
    bodiesToRemove.forEach(body => { if (Composite.get(world, body.id, 'body')) { World.remove(world, body); } });
    balls = []; activeParticles = []; activeRipples = []; backgroundRipples = []; recentHits = [];
    sessionScore = 0; highScorePoints = 0;
    for (let i = 0; i < numSlots; i++) { slotBounceState[i] = 0; slotHitCounts[i] = 0; histogramBarPulseState[i] = 0; slotGlowState[i] = 0; }
    pegs.forEach(peg => { if (peg.plugin) peg.plugin.glowTimer = 0; });
    isDoubleDropActive = false; doubleDropTimer = 0; isDoubleMultiplierActive = false; doubleMultiplierTimer = 0;
    isNextDropBonus = false; bonusBallMessage = ''; bonusBallTimer = 0;
    doubleDropMessage = ''; doubleDropMessageTimer = 0; doubleMultiplierMessage = ''; doubleMultiplierMessageTimer = 0;
    highScoreEnded = false; isGameOverConditionMet = false; goldLossFlashActive = false;
    isGameOverFromDecay = false;
    isGoldLossCountdownActive = false; goldLossMessageActive = false; goldLostAmountForDisplay = 0;

    if (speedSlider) speedSlider.value = defaultSpeedSliderDisplay;
    if (ballSizeSlider) ballSizeSlider.value = baseBallRadius;

    gravityScale = map(speedSlider?.value ?? defaultSpeedSliderDisplay, minSpeedSliderDisplayValue, maxSpeedSliderDisplayValue, minActualGravity, maxActualGravity);
    if (engine) engine.world.gravity.y = gravityScale;
    currentBallRadius = ballSizeSlider?.value ?? baseBallRadius;

    if (currentGameMode === 'SURVIVAL') {
        score = initialScoreSurvival;
        betAmount = minBetAmount;
        if (betSlider) { betSlider.value = betAmount; betSlider.enabled = true; }
        if (speedSlider) speedSlider.enabled = false;
        ballsRemaining = Infinity;
        highScorePoints = 0;
        survivalStartTime = millis(); lastDecayTime = survivalStartTime;
        currentDecayPercent = survivalInitialDecayPercent; nextDecayTime = survivalStartTime + survivalDecayStartDelay;
    } else if (currentGameMode === 'HIGHSCORE') {
        score = highScoreStartingGold;
        ballsRemaining = highScoreBallsTotal;
        betAmount = minBetAmount;
        if (betSlider) { betSlider.value = betAmount; betSlider.enabled = false; }
        if (speedSlider) speedSlider.enabled = true;
        highScorePoints = 0;
        survivalStartTime = 0; lastDecayTime = 0; currentDecayPercent = 0; nextDecayTime = Infinity;
    } else {
        console.error("resetGame: No game mode selected! Resetting to default state.");
        score = 0; ballsRemaining = 0; highScorePoints = 0;
        if (betSlider) betSlider.enabled = false;
        if (speedSlider) speedSlider.enabled = true;
        survivalStartTime = 0; lastDecayTime = 0; currentDecayPercent = 0; nextDecayTime = Infinity;
    }

    gameOverState = 'NONE'; leaderboardData = null; leaderboardLoading = false; leaderboardError = null;
    hideLeaderboardForm();
}