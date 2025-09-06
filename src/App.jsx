import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, Legend
} from 'recharts';

// Macro and Game Configuration
const investmentsConfig = [
  { id: 'blue_chip', name: 'Blue-Chip Equities', description: 'Stable, large-cap companies.', cost: 50000, risk: 'Low', returnRange: [0.01, 0.05], class: 'Equities', beta: 0.8, correlations: { gdp: 0.8, interestRate: -0.3, inflation: -0.1 } },
  { id: 'small_cap', name: 'Small-Cap Equities', description: 'High-growth companies.', cost: 20000, risk: 'High', returnRange: [0.05, 0.20], class: 'Equities', beta: 1.5, correlations: { gdp: 1.2, interestRate: -0.5, inflation: 0.1 } },
  { id: 'bonds', name: 'Government Bonds', description: 'Safe investment with fixed returns.', cost: 10000, risk: 'Very Low', returnRange: [0.005, 0.015], class: 'Fixed Income', beta: 0.1, correlations: { gdp: -0.2, interestRate: 0.9, inflation: -0.8 } },
  { id: 'crypto', name: 'Cryptocurrency', description: 'Extremely volatile digital assets.', cost: 5000, risk: 'Very High', returnRange: [-0.4, 0.5], class: 'Alternatives', beta: 2.5, correlations: { gdp: 0.3, interestRate: -0.2, inflation: 0.2 } },
  { id: 'commodities_gold', name: 'Gold', description: 'Safe-haven commodity, shines in inflation and crises.', cost: 20000, risk: 'Medium', returnRange: [-0.05, 0.10], class: 'Commodities', beta: 0.5, correlations: { gdp: -0.3, interestRate: -0.1, inflation: 0.7 } },
  { id: 'real_estate', name: 'Real Estate Funds', description: 'Funds invested in commercial and residential properties.', cost: 30000, risk: 'Medium', returnRange: [0.02, 0.08], class: 'Real Estate', beta: 0.6, correlations: { gdp: 0.6, interestRate: -0.5, inflation: 0.5 } },
  { id: 'private_equity', name: 'Private Equity', description: 'Investments in private companies.', cost: 75000, risk: 'High', returnRange: [0.08, 0.30], class: 'Alternatives', beta: 1.8, correlations: { gdp: 1.5, interestRate: -0.8, inflation: 0.2 } }
];

const marketEvents = [
  { type: 'Bull', text: 'A strong bull market is underway! Market sentiment is positive.', multiplier: 1.5, trustChange: 1, probability: 0.3 },
  { type: 'Bear', text: 'A recession is beginning. The market is in a downturn.', multiplier: 0.5, trustChange: -2, probability: 0.3 },
  { type: 'Neutral', text: 'The market is moving sideways. No major news to report.', multiplier: 1.0, trustChange: 0, probability: 0.4 },
  { type: 'Political', text: 'New Tax Law reduces equity returns for 2 quarters.', multiplier: 0.8, trustChange: 0, probability: 0.1, assetClass: 'Equities' },
  { type: 'Political', text: 'Stimulus Package boosts client inflows.', multiplier: 1.2, trustChange: 5, probability: 0.1, eventType: 'clientBoost' },
  { type: 'Regulatory', text: 'Sanctions hit commodities. Expected returns -20%.', multiplier: 0.8, trustChange: -1, probability: 0.1, assetClass: 'Commodities' }
];

const CompetitorsConfig = [
  { name: "Apex Global", aum: 900000, aggressiveness: 1.1, volatility: 0.1, pnl: 0 },
  { name: "Titan Investments", aum: 1100000, aggressiveness: 0.9, volatility: 0.05, pnl: 0 },
  { name: "Veridian Capital", aum: 800000, aggressiveness: 1.5, volatility: 0.2, pnl: 0 }
];

const achievementsConfig = [
  { id: 'first_million', name: 'First Millionaire', description: 'Achieve an AUM of $1M.', threshold: 1000000, type: 'aum' },
  { id: 'first_billion', name: 'The Billionaire', description: 'Achieve an AUM of $1B.', threshold: 1000000000, type: 'aum' },
  { id: 'survived_bear', name: 'Survived The Bear', description: 'Survive a bear market with a positive AUM.', type: 'event', event: 'Bear' },
  { id: 'perfect_trust', name: 'Client Favorite', description: 'Reach 100% client trust.', threshold: 100, type: 'trust' },
  { id: 'long_run', name: 'Marathon Runner', description: 'Survive for 20 quarters.', threshold: 20, type: 'quarter' }
];

const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '$0';
  const sign = Math.sign(num) === -1 ? '-' : '';
  const absNum = Math.abs(num);
  if (absNum >= 1e12) return `${sign}${(absNum / 1e12).toFixed(2)}T`;
  if (absNum >= 1e9) return `${sign}${(absNum / 1e9).toFixed(2)}B`;
  if (absNum >= 1e6) return `${sign}${(absNum / 1e6).toFixed(2)}M`;
  if (absNum >= 1e3) return `${sign}${(absNum / 1e3).toFixed(2)}K`;
  return `${sign}$${absNum.toFixed(0)}`;
};
  
const cleanText = (text) => text.replace(/\*\*/g, '');

const InvestmentFirmDashboard = () => {
  const [aum, setAum] = useState(1000000);
  const [clientTrust, setClientTrust] = useState(100);
  const [quarter, setQuarter] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [operationalBurnRate, setOperationalBurnRate] = useState(50000);
  const [firmName, setFirmName] = useState('Phrontera Capital');
  const [investmentHoldings, setInvestmentHoldings] = useState({});
  const [logEvents, setLogEvents] = useState([]);
  const [newsTickerEvents, setNewsTickerEvents] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isBankrupt, setIsBankrupt] = useState(false);
  const [buyQuantities, setBuyQuantities] = useState({});
  const [history, setHistory] = useState([]);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [macroVariables, setMacroVariables] = useState({ gdp: 1, interestRate: 0.01, inflation: 0.02 });
  const [competitors, setCompetitors] = useState(CompetitorsConfig);
  const [highScores, setHighScores] = useState({});
  const [achievements, setAchievements] = useState({});
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);
  const [showReportCard, setShowReportCard] = useState(false);
  const [quarterlyReport, setQuarterlyReport] = useState({});
  const [difficultyFactor, setDifficultyFactor] = useState(1);

  // --- LOCALSTORAGE & INITIALIZATION ---
  useEffect(() => {
    // Load state from localStorage
    const savedHighScores = JSON.parse(localStorage.getItem('highScores')) || { aum: 0, quarters: 0, trust: 0 };
    const savedAchievements = JSON.parse(localStorage.getItem('achievements')) || {};
    setHighScores(savedHighScores);
    setAchievements(savedAchievements);
  }, []);

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem('highScores', JSON.stringify(highScores));
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [highScores, achievements]);

  // --- HELPER FUNCTIONS ---
  const logEvent = (message, type, forTicker) => {
    const event = { message: cleanText(message), type, timestamp: new Date().toLocaleString(), forTicker };
    setLogEvents(prev => [event, ...prev]);
    if (forTicker) {
      setNewsTickerEvents(prev => [...prev, event]);
    }
  };

  const updateHighScores = (newAum, newQuarter, newTrust) => {
    setHighScores(prev => ({
      aum: Math.max(prev.aum, newAum),
      quarters: Math.max(prev.quarters, newQuarter),
      trust: Math.max(prev.trust, newTrust)
    }));
  };

  const checkForAchievements = (currentAum, currentQuarter, currentTrust, eventType) => {
    achievementsConfig.forEach(achievement => {
      if (!achievements[achievement.id]) {
        let unlocked = false;
        if (achievement.type === 'aum' && currentAum >= achievement.threshold) {
          unlocked = true;
        } else if (achievement.type === 'trust' && currentTrust >= achievement.threshold) {
          unlocked = true;
        } else if (achievement.type === 'quarter' && currentQuarter >= achievement.threshold) {
          unlocked = true;
        } else if (achievement.type === 'event' && eventType === achievement.event) {
          unlocked = true;
        }

        if (unlocked) {
          setAchievements(prev => ({ ...prev, [achievement.id]: true }));
          setUnlockedAchievement(achievement);
          logEvent(`🎉 Achievement Unlocked: ${achievement.name}`, 'achievement', false);
        }
      }
    });
  };

  const getWeightedRandomMarketEvent = () => {
    const totalWeight = marketEvents.reduce((sum, event) => sum + event.probability, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < marketEvents.length; i++) {
      if (randomNum < marketEvents[i].probability) {
        return marketEvents[i];
      }
      randomNum -= marketEvents[i].probability;
    }
    return marketEvents[0]; // Fallback
  };
  
  const getPortfolioAllocation = () => {
    const totalValue = Object.values(investmentHoldings).reduce((sum, holding) => sum + holding.currentValue, 0);
    if (totalValue === 0) return [];
    const allocation = {};
    Object.values(investmentHoldings).forEach(holding => {
      const className = investmentsConfig.find(i => i.id === holding.id)?.class || 'Other';
      if (!allocation[className]) {
        allocation[className] = 0;
      }
      allocation[className] += holding.currentValue;
    });
    return Object.keys(allocation).map(key => ({
      name: key,
      value: (allocation[key] / totalValue) * 100,
      displayValue: allocation[key]
    }));
  };

  // --- GAME LOGIC ---
  const runQuarter = () => {
    if (isBankrupt) return;
    if (aum <= operationalBurnRate) {
      logEvent("Your firm's capital is insufficient to cover operational burn rate. You are bankrupt!", 'loss', false);
      setIsBankrupt(true);
      return;
    }

    setWhatIfResult(null); // Clear what-if results on a real quarter run
    setNewsTickerEvents([]);
    const newQuarter = quarter + 1;
    setQuarter(newQuarter);
    
    // Dynamic Difficulty
    if (pnl / aum > 0.3) setDifficultyFactor(prev => prev * 1.05);

    // Update Macroeconomic Variables (simple random walk)
    setMacroVariables(prev => ({
      gdp: Math.max(0.5, prev.gdp + (Math.random() - 0.5) * 0.1),
      interestRate: Math.max(0.005, prev.interestRate + (Math.random() - 0.5) * 0.005),
      inflation: Math.max(0, prev.inflation + (Math.random() - 0.5) * 0.005)
    }));

    // Select Market and Political Event
    let marketEvent = getWeightedRandomMarketEvent();
    const isPolitical = marketEvent.type === 'Political' || marketEvent.type === 'Regulatory';
    if (isPolitical) {
      logEvent(`<strong>Political News:</strong> ${marketEvent.text}`, 'event', true);
    } else {
      logEvent(`<strong>Market News:</strong> ${marketEvent.text}`, 'event', true);
    }
    
    // Calculate P&L based on market, macro, and holdings
    let currentPnl = 0;
    const updatedHoldings = { ...investmentHoldings };
    Object.keys(updatedHoldings).forEach(key => {
      const holding = updatedHoldings[key];
      const asset = investmentsConfig.find(inv => inv.id === holding.id);
      let returnRate = asset.returnRange[0] + Math.random() * (asset.returnRange[1] - asset.returnRange[0]);
      
      // Apply macro correlations
      returnRate += (macroVariables.gdp - 1) * asset.correlations.gdp;
      returnRate += (macroVariables.interestRate - 0.01) * asset.correlations.interestRate;
      returnRate += (macroVariables.inflation - 0.02) * asset.correlations.inflation;

      // Apply market event multiplier
      let effectiveMultiplier = marketEvent.multiplier;
      if ((marketEvent.assetClass && asset.class === marketEvent.assetClass) || (marketEvent.id && marketEvent.id === asset.id)) {
        effectiveMultiplier = marketEvent.multiplier;
      } else {
        effectiveMultiplier = 1;
      }
      
      const investmentProfit = holding.currentValue * returnRate * effectiveMultiplier;
      currentPnl += investmentProfit;
      updatedHoldings[key] = {
        ...holding,
        currentValue: holding.currentValue + investmentProfit,
        pnl: holding.pnl + investmentProfit
      };
    });

    const managementFee = aum * 0.005;
    currentPnl += managementFee - (operationalBurnRate * difficultyFactor);

    let newAum = aum + currentPnl;
    
    let clientChange = 0;
    let trustDelta = marketEvent.trustChange;
    if (currentPnl > 0) {
      setClientTrust(prev => Math.min(100, prev + 5 + trustDelta));
      if (clientTrust > 90) clientChange = (0.05 * newAum) * difficultyFactor;
    } else {
      setClientTrust(prev => Math.max(0, prev - 10 + trustDelta));
      if (clientTrust < 30) clientChange = (-0.1 * newAum) * difficultyFactor;
    }
    if(marketEvent.eventType === 'clientBoost') clientChange += 0.05 * newAum;

    newAum += clientChange;

    // Simulate Competitors
    const updatedCompetitors = competitors.map(rival => {
      let rivalReturn = (Math.random() - 0.5) * rival.volatility * (marketEvent.multiplier * rival.aggressiveness);
      let rivalPnl = rival.aum * rivalReturn;
      return { ...rival, aum: rival.aum + rivalPnl, pnl: rivalPnl };
    });

    // Update State
    setAum(newAum);
    setPnl(currentPnl);
    setInvestmentHoldings(updatedHoldings);
    setCompetitors(updatedCompetitors);
    setHistory(prev => [...prev, { quarter: newQuarter, aum: newAum, pnl: currentPnl }]);
    
    // Log and Check
    logEvent(`Your investments yielded a **P/L of ${currentPnl >= 0 ? '+' : ''}${formatNumber(currentPnl)}**.`, currentPnl >= 0 ? 'profit' : 'loss', true);
    logEvent(`Client capital changed by **${clientChange >= 0 ? '+' : ''}${formatNumber(clientChange)}**.`, clientChange >= 0 ? 'profit' : 'loss', true);
    updateHighScores(newAum, newQuarter, clientTrust);
    checkForAchievements(newAum, newQuarter, clientTrust, marketEvent.type);

    // Generate and show report
    setQuarterlyReport({
      marketEvent: marketEvent.text,
      macro: macroVariables,
      pnl: currentPnl,
      clientChange: clientChange,
      competitors: updatedCompetitors,
      firmName: firmName,
      ceoMessage: getRandomCEOQuote(),
    });
    setShowReportCard(true);
  };
  
  const getRandomCEOQuote = () => {
    const quotes = [
      "The market is a fickle beast, but our strategy is a fortress.",
      "A moment of chaos is an opportunity for those who are prepared.",
      "Our fiduciary duty is not to be profitable, but to be wise.",
      "The path to success is paved with data, not emotion.",
      "Another quarter, another step toward greatness."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const runWhatIfSimulation = () => {
    if (isBankrupt) return;
    const marketEvent = getWeightedRandomMarketEvent();
    let simulatedPnl = 0;
    const tempHoldings = { ...investmentHoldings };

    Object.keys(tempHoldings).forEach(key => {
      const holding = tempHoldings[key];
      const asset = investmentsConfig.find(inv => inv.id === holding.id);
      let returnRate = asset.returnRange[0] + Math.random() * (asset.returnRange[1] - asset.returnRange[0]);
      
      // Apply macro correlations
      returnRate += (macroVariables.gdp - 1) * asset.correlations.gdp;
      returnRate += (macroVariables.interestRate - 0.01) * asset.correlations.interestRate;
      returnRate += (macroVariables.inflation - 0.02) * asset.correlations.inflation;

      let effectiveMultiplier = marketEvent.multiplier;
      if ((marketEvent.assetClass && asset.class === marketEvent.assetClass) || (marketEvent.id && marketEvent.id === asset.id)) {
        effectiveMultiplier = marketEvent.multiplier;
      } else {
        effectiveMultiplier = 1;
      }

      const investmentProfit = holding.currentValue * returnRate * effectiveMultiplier;
      simulatedPnl += investmentProfit;
    });

    const managementFee = aum * 0.005;
    simulatedPnl += managementFee - (operationalBurnRate * difficultyFactor);
    
    let simulatedClientChange = 0;
    if (simulatedPnl > 0) {
      if (clientTrust > 90) simulatedClientChange = 0.05 * aum;
    } else {
      if (clientTrust < 30) simulatedClientChange = -0.1 * aum;
    }
    
    setWhatIfResult({
      marketEvent: marketEvent.type,
      pnl: simulatedPnl,
      clientChange: simulatedClientChange,
    });
  };

  const invest = (assetId) => {
    const asset = investmentsConfig.find(inv => inv.id === assetId);
    const quantity = buyQuantities[assetId] || 1;
    const totalCost = asset.cost * quantity;

    if (aum < totalCost) {
      logEvent("You don't have enough capital to make this investment.", 'loss');
      return;
    }
    setAum(prev => prev - totalCost);
    setInvestmentHoldings(prev => {
      const newHoldings = { ...prev };
      if (newHoldings[asset.id]) {
        newHoldings[asset.id].currentValue += totalCost;
        newHoldings[asset.id].initialCost += totalCost;
        newHoldings[asset.id].quantity += quantity;
      } else {
        newHoldings[asset.id] = { ...asset, currentValue: totalCost, initialCost: totalCost, pnl: 0, quantity: quantity };
      }
      return newHoldings;
    });
    logEvent(`You invested **${formatNumber(totalCost)}** in **${asset.name}**.`, 'profit', false);
  };

  const sellGroupedHolding = (assetId) => {
    const holding = investmentHoldings[assetId];
    if (!holding) return;
    setAum(prev => prev + holding.currentValue);
    setInvestmentHoldings(prev => {
      const newHoldings = { ...prev };
      delete newHoldings[assetId];
      return newHoldings;
    });
    logEvent(`You sold all **${holding.name}** for **${formatNumber(holding.currentValue)}**. Realized P/L: **${holding.pnl >= 0 ? '+' : ''}${formatNumber(holding.pnl)}**.`, holding.pnl >= 0 ? 'profit' : 'loss', false);
  };

  const sellAllHoldings = () => {
    const totalValue = Object.values(investmentHoldings).reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalPnl = Object.values(investmentHoldings).reduce((sum, holding) => sum + holding.pnl, 0);
    setAum(prev => prev + totalValue);
    setInvestmentHoldings({});
    logEvent(`You sold your entire portfolio. Realized P/L: **${totalPnl >= 0 ? '+' : ''}${formatNumber(totalPnl)}**.`, totalPnl >= 0 ? 'profit' : 'loss', false);
  };

  const handleQuantityChange = (id, value) => {
    const parsedValue = parseInt(value, 10);
    setBuyQuantities(prev => ({
      ...prev,
      [id]: isNaN(parsedValue) || parsedValue < 1 ? 1 : parsedValue,
    }));
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const restartGame = () => {
    setAum(1000000);
    setClientTrust(100);
    setQuarter(0);
    setPnl(0);
    setInvestmentHoldings({});
    setLogEvents([]);
    setNewsTickerEvents([]);
    setIsBankrupt(false);
    setHistory([]);
    setWhatIfResult(null);
    setMacroVariables({ gdp: 1, interestRate: 0.01, inflation: 0.02 });
    setCompetitors(CompetitorsConfig);
    setDifficultyFactor(1);
    setShowReportCard(false);
  };
  
  const allocationData = getPortfolioAllocation();
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#6366f1'];

  const FinancialCard = ({ title, value, isPnl, className = '' }) => {
    const isLoss = isPnl && value < 0;
    return (
      <div className={`rounded-xl border ${isDarkMode ? 'border-neutral-800/50' : 'border-neutral-300'} p-6 ${isPnl && (isLoss ? 'text-red-500' : isDarkMode ? 'text-lime-400' : 'text-lime-600')} ${className}`}>
        <p className={`text-sm uppercase opacity-60 mb-1 ${isDarkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>{title}</p>
        <h3 className="text-2xl font-bold font-mono tracking-tight">{isPnl ? (value > 0 ? '+' : '') : ''}{formatNumber(value)}</h3>
      </div>
    );
  };

  const InvestmentCard = ({ asset, onInvest, quantity, onQuantityChange }) => (
    <div className={`flex flex-col rounded-xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-neutral-300 bg-white/50'} p-6`}>
      <h4 className="text-lg font-bold mb-2">{asset.name}</h4>
      <p className="text-sm opacity-70 mb-4">{asset.description}</p>
      <div className="flex items-center justify-between text-sm mb-2">
        <p>Cost:</p> <span className={`font-semibold ${isDarkMode ? 'text-lime-400' : 'text-lime-600'}`}>{formatNumber(asset.cost)}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-4">
        <p>Risk:</p> <span className={`font-semibold ${asset.risk === 'Very High' ? 'text-red-500' : ''}`}>{asset.risk}</span>
      </div>
      <div className="flex items-center space-x-2 mt-auto">
        <input
          type="number"
          value={quantity || 1}
          onChange={(e) => handleQuantityChange(asset.id, e.target.value)}
          min="1"
          className={`w-1/3 py-2 px-3 rounded-lg ${isDarkMode ? 'bg-neutral-800 text-center font-mono text-sm border border-neutral-700' : 'bg-neutral-200 text-center font-mono text-sm border border-neutral-300'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-lime-500' : 'focus:ring-lime-600'}`}
        />
        <button 
          onClick={() => invest(asset.id)}
          className={`w-2/3 py-2 px-4 rounded-lg ${isDarkMode ? 'bg-lime-500 text-neutral-900' : 'bg-lime-600 text-white'} font-bold transition-transform hover:scale-[1.02] active:scale-100 disabled:opacity-50`}
          disabled={aum < asset.cost * (quantity || 1)}
        >
          Invest
        </button>
      </div>
    </div>
  );

  const HoldingCard = ({ holding, onSell }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col rounded-xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-neutral-300 bg-white/50'} p-6`}
    >
      <h4 className="text-lg font-bold mb-2">{holding.name} ({holding.quantity})</h4>
      <div className="flex items-center justify-between text-sm mb-1">
        <p>Current Value:</p> <span className={`font-semibold ${holding.pnl >= 0 ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : 'text-red-500'}`}>{formatNumber(holding.currentValue)}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-4">
        <p>Realized P/L:</p> <span className={`font-semibold ${holding.pnl >= 0 ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : 'text-red-500'}`}>{holding.pnl >= 0 ? '+' : ''}{formatNumber(holding.pnl)}</span>
      </div>
      <button 
        onClick={() => onSell(holding.id)}
        className="w-full mt-auto py-2 px-4 rounded-lg bg-red-500 text-neutral-900 font-bold transition-transform hover:scale-[1.02] active:scale-100"
      >
        Liquidate
      </button>
    </motion.div>
  );

  const ReportCard = ({ report, onClose }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm"
    >
      <div className={`rounded-3xl p-8 max-w-2xl w-full border ${isDarkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-300 bg-white'}`}>
        <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-lime-400' : 'text-lime-600'}`}>Quarter {quarter} Report</h3>
        <p className="text-sm opacity-60 mb-6">A summary of your firm's performance and market conditions.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded-xl">
            <p className="text-sm opacity-60">Firm P/L</p>
            <span className={`text-xl font-bold ${report.pnl > 0 ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : 'text-red-500'}`}>{report.pnl > 0 ? '+' : ''}{formatNumber(report.pnl)}</span>
          </div>
          <div className="p-4 border rounded-xl">
            <p className="text-sm opacity-60">Client Capital</p>
            <span className={`text-xl font-bold ${report.clientChange > 0 ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : 'text-red-500'}`}>{report.clientChange > 0 ? '+' : ''}{formatNumber(report.clientChange)}</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-bold mb-2">Market & Macro Outlook</h4>
          <p className="text-sm opacity-80">{report.marketEvent}</p>
          <ul className="text-xs opacity-60 mt-2 space-y-1">
            <li>GDP Growth: {report.macro.gdp.toFixed(2)}</li>
            <li>Interest Rate: {(report.macro.interestRate * 100).toFixed(2)}%</li>
            <li>Inflation: {(report.macro.inflation * 100).toFixed(2)}%</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h4 className="font-bold mb-2">Rival Performance</h4>
          <ul className="text-sm space-y-1">
            {report.competitors.sort((a,b) => b.aum - a.aum).map(rival => (
              <li key={rival.name} className="flex justify-between items-center">
                <span>{rival.name}: <span className="font-mono">{formatNumber(rival.aum)}</span></span>
                <span className={`font-mono ${rival.pnl > 0 ? 'text-lime-400' : 'text-red-500'}`}>{rival.pnl > 0 ? '+' : ''}{formatNumber(rival.pnl)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 border-l-4 rounded-xl border-lime-500/50 bg-lime-500/10 mb-6">
          <p className="text-sm font-bold opacity-60">CEO Message</p>
          <p className="italic">{report.ceoMessage}</p>
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-lg bg-lime-500 text-neutral-900 font-bold transition-transform hover:scale-[1.02] active:scale-100">
          Dismiss Report
        </button>
      </div>
    </motion.div>
  );

  const tickerContent = [...newsTickerEvents, ...newsTickerEvents];

  return (
    <div className={`${isDarkMode ? 'dark bg-neutral-950 text-neutral-100' : 'bg-stone-100 text-stone-900'} font-sans min-h-screen transition-colors duration-300`}>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=IBM+Plex+Mono:wght@400;700&display=swap');
        
        @font-face {
          font-family: 'Gambarino';
          src: url('/fonts/Gambarino-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-display { font-family: 'Gambarino', serif; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: rgba(120, 120, 120, 0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background-color: rgba(120, 120, 120, 0.4); }
        
        html.light ::-webkit-scrollbar-thumb { background-color: rgba(180, 180, 180, 0.2); }
        html.light ::-webkit-scrollbar-thumb:hover { background-color: rgba(180, 180, 180, 0.4); }
        
        .dark ::selection { background-color: rgba(120, 120, 120, 0.5); }
        .light ::selection { background-color: rgba(120, 120, 120, 0.2); }

        .ticker-container {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .ticker-content {
          display: inline-block;
          padding-left: 100%;
          animation: ticker-scroll 20s linear infinite;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        `}
      </style>
      
      <div className={`ticker-container text-lg py-4 ${isDarkMode ? 'bg-neutral-800/80 text-neutral-400' : 'bg-stone-200/80 text-stone-600'} backdrop-blur-sm`}>
        <div className="ticker-content">
          {tickerContent.length > 0 ? (
            tickerContent.map((log, index) => (
                <span key={`${log.type}-${index}`} className="mx-8">
                <span className={`font-extrabold ${log.type === 'profit' ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : log.type === 'loss' ? 'text-red-500' : 'text-neutral-400'}`}>
                  {log.type === 'profit' ? '📈 PROFIT:' : log.type === 'loss' ? '📉 LOSS:' : '🔔 ALERT:'}
                </span>
                <span className="ml-2" dangerouslySetInnerHTML={{ __html: log.message }}></span>
              </span>
            ))
          ) : (
            <span className="mx-8 font-extrabold">No relevant news this quarter.</span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {unlockedAchievement && (
          <motion.div
            key={unlockedAchievement.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 100) setUnlockedAchievement(null);
            }}
            className={`fixed bottom-8 right-8 z-[9999] p-4 rounded-xl shadow-xl flex items-start space-x-3 ${isDarkMode ? 'bg-neutral-800 text-lime-400' : 'bg-white text-lime-600'} border-l-4 border-lime-500`}
          >
            <div>
              <h4 className="font-bold">Achievement Unlocked!</h4>
              <p className="text-sm opacity-80">
                {unlockedAchievement.name}: {unlockedAchievement.description}
              </p>
            </div>
            <button
              onClick={() => setUnlockedAchievement(null)}
              className="ml-2 text-neutral-400 hover:text-red-400 font-bold"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportCard && (
          <ReportCard report={quarterlyReport} onClose={() => setShowReportCard(false)} />
        )}
      </AnimatePresence>

      <main className="container mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center my-12"
        >
          <input
            type="text"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
            className={`text-4xl md:text-6xl font-display tracking-tight mb-4 text-center bg-transparent border-b border-dashed ${isDarkMode ? 'border-neutral-700' : 'border-stone-400'} outline-none focus:border-lime-500`}
          />
          <p className="text-base md:text-lg opacity-70 max-w-2xl mx-auto">
            Run your own investment firm. Buy, sell, and manage assets as you navigate a dynamic global market.
          </p>
        </motion.div>

        <div className="flex justify-end mb-4">
          <motion.button
            onClick={toggleTheme}
            className={`p-2 rounded-full border ${isDarkMode ? 'border-neutral-800/50 hover:bg-neutral-800' : 'border-stone-300 hover:bg-stone-200'} transition-colors`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className={`md:col-span-2 rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8 flex flex-col justify-between relative overflow-hidden`}
          >
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-lime-500/5' : 'bg-lime-500/10'} opacity-50 blur-3xl rounded-full`} />
            <div className="relative z-10">
              <h3 className="text-sm uppercase opacity-60 mb-2">AUM</h3>
              <div className="flex items-end justify-between">
                <h2 className={`text-5xl md:text-7xl font-display tracking-tight ${isDarkMode ? 'text-lime-400' : 'text-lime-600'} font-mono`}>{formatNumber(aum)}</h2>
                <div className="text-right">
                  <p className="text-sm uppercase opacity-60">Quarterly P/L</p>
                  <span className={`text-2xl font-bold font-mono ${pnl >= 0 ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : 'text-red-500'}`}>{pnl > 0 ? '+' : ''}{formatNumber(pnl)}</span>
                </div>
              </div>
            </div>
            <div className="mt-8 relative z-10 flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="opacity-60 uppercase">Client Trust Score</span>
                <span className="font-bold text-lg">{clientTrust}%</span>
              </div>
              <div className="flex flex-col">
                <span className="opacity-60 uppercase">Quarter</span>
                <span className="font-bold text-lg">{quarter}</span>
              </div>
              <div className="flex flex-col">
                <span className="opacity-60 uppercase">Operational Burn Rate</span>
                <span className="font-bold text-lg">{formatNumber(operationalBurnRate)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
            className={`rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8 flex flex-col justify-between`}
          >
            <h3 className="text-xl font-bold mb-4">Macroeconomics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-60">GDP Growth:</span>
                <span className="font-mono text-lg font-bold">{(macroVariables.gdp * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-60">Interest Rate:</span>
                <span className="font-mono text-lg font-bold">{(macroVariables.interestRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-60">Inflation:</span>
                <span className="font-mono text-lg font-bold">{(macroVariables.inflation * 100).toFixed(2)}%</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Performance Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          className={`rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8 mb-8`}
        >
          <h3 className="text-xl font-bold mb-4">Performance History</h3>
          <p className="text-sm opacity-60 mb-4">Track AUM (left axis) and P/L (right axis) over time.</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" stroke={isDarkMode ? '#a3e635' : '#65a30d'} />
              <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#f87171' : '#ef4444'} />
              <Tooltip formatter={(value, name) => [formatNumber(value), name === 'aum' ? 'AUM' : 'P/L']} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="aum" stroke={isDarkMode ? '#a3e635' : '#65a30d'} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="pnl" stroke={isDarkMode ? '#f87171' : '#ef4444'} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className={`rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8 flex flex-col`}
          >
            <h3 className="text-xl font-bold mb-4">Investment Opportunities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[400px]">
              {investmentsConfig.map(asset => (
                <InvestmentCard 
                  key={asset.id} 
                  asset={asset} 
                  onInvest={invest} 
                  quantity={buyQuantities[asset.id]}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className={`rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8 flex flex-col`}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
              Current Holdings
              <AnimatePresence>
                {Object.keys(investmentHoldings).length > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    onClick={sellAllHoldings}
                    className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    Liquidate All
                  </motion.button>
                )}
              </AnimatePresence>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[400px]">
              <AnimatePresence>
                {Object.keys(investmentHoldings).length === 0 ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm opacity-60">You have no active investments.</motion.p>
                ) : (
                  Object.values(investmentHoldings).map(holding => (
                    <HoldingCard key={holding.id} holding={holding} onSell={sellGroupedHolding} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Portfolio Allocation Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
          className={`rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8 mb-8`}
        >
          <h3 className="text-xl font-bold mb-4">Portfolio Allocation</h3>
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value.toFixed(1)}%`, props.payload.name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm opacity-60">Your portfolio is currently empty. Invest in some assets to see your allocation here.</p>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            className={`md:col-span-2 rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8`}
          >
            <h3 className="text-xl font-bold mb-4">Activity Log</h3>
            <div className="h-[250px] overflow-y-auto pr-4">
              {logEvents.map((log, index) => (
                <p key={index} className={`py-1 text-sm ${log.type === 'profit' ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : log.type === 'loss' ? 'text-red-500' : (isDarkMode ? 'text-neutral-300' : 'text-stone-700')}`}>
                  <span className="opacity-60 mr-2">{log.timestamp}</span>
                  <span dangerouslySetInnerHTML={{ __html: log.message }}></span>
                </p>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
            className={`flex flex-col justify-center items-center rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8`}
          >
            {isBankrupt ? (
              <button
                onClick={restartGame}
                className={`w-full py-6 rounded-2xl bg-red-500 text-white text-2xl font-extrabold transition-transform hover:scale-[1.02] active:scale-100`}
              >
                Restart Firm
              </button>
            ) : (
              <>
                <div className="mb-4 text-center">
                  <h4 className="text-lg font-bold mb-2">Market Outlook</h4>
                  <p className="text-sm opacity-70">Probabilities for the next quarter:</p>
                  <ul className="text-sm font-bold mt-2">
                  {marketEvents.map((event, index) => (
                   <li key={`${event.type}-${index}`} className={`${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                     {event.type}: {(event.probability * 100).toFixed(0)}%
                   </li>
                ))}

                  </ul>
                  {whatIfResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-lg border text-left ${isDarkMode ? 'border-neutral-700 bg-neutral-800' : 'border-stone-300 bg-stone-200'}`}
                    >
                      <h5 className="font-bold text-sm mb-1">"What If" Scenario</h5>
                      <p className="text-xs opacity-80 mb-2">Based on a **{whatIfResult.marketEvent}** market:</p>
                      <p className={`text-sm font-bold ${whatIfResult.pnl >= 0 ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : 'text-red-500'}`}>
                        P/L: {whatIfResult.pnl > 0 ? '+' : ''}{formatNumber(whatIfResult.pnl)}
                      </p>
                      <p className={`text-sm font-bold ${whatIfResult.clientChange >= 0 ? (isDarkMode ? 'text-lime-400' : 'text-lime-600') : 'text-red-500'}`}>
                        Client Capital: {whatIfResult.clientChange > 0 ? '+' : ''}{formatNumber(whatIfResult.clientChange)}
                      </p>
                    </motion.div>
                  )}
                  <button
                    onClick={runWhatIfSimulation}
                    className={`mt-4 w-full py-2 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] active:scale-100 ${isDarkMode ? 'bg-neutral-800 text-neutral-300 border border-neutral-700' : 'bg-stone-200 text-stone-700 border border-stone-300'}`}
                  >
                    Run "What If?" Simulation
                  </button>
                </div>
                <button
                  onClick={runQuarter}
                  className={`w-full py-6 rounded-2xl ${isDarkMode ? 'bg-lime-500 text-neutral-900' : 'bg-lime-600 text-white'} text-2xl font-extrabold transition-transform hover:scale-[1.02] active:scale-100`}
                >
                  Advance Quarter
                </button>
              </>
            )}
          </motion.div>
        </div>
        
        {/* High Score & Competitor Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8`}
        >
          <div className={`rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8`}>
            <h3 className="text-xl font-bold mb-4">High Scores</h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-sm font-bold opacity-60">
                <span>Metric</span>
                <span>Value</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Highest AUM</span>
                <span className="font-mono">{formatNumber(highScores.aum)}</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Longest Survival</span>
                <span className="font-mono">{highScores.quarters} Quarters</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Highest Trust</span>
                <span className="font-mono">{highScores.trust}%</span>
              </li>
            </ul>
          </div>
          <div className={`rounded-3xl border ${isDarkMode ? 'border-neutral-800/50 backdrop-blur-sm bg-neutral-900/50' : 'border-stone-300 bg-white/50'} p-8`}>
            <h3 className="text-xl font-bold mb-4">Competitor Leaderboard</h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-sm font-bold opacity-60">
                <span>Firm</span>
                <span>AUM</span>
              </li>
              <li className="flex justify-between items-center font-bold text-lime-400">
                <span>{firmName} (You)</span>
                <span className="font-mono">{formatNumber(aum)}</span>
              </li>
              {competitors.sort((a,b) => b.aum - a.aum).map((rival, index) => (
                <li key={`${rival.name}-${index}`} className="flex justify-between items-center">
                  <span>{rival.name}</span>
                  <span className="font-mono">{formatNumber(rival.aum)}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </main>

      <footer className="text-center text-sm opacity-70 mt-10 p-4">
        Made with ❤️ by <a href="https://github.com/arxivius/" target="_blank" className="underline hover:text-lime-400">arXiVius</a>
      </footer>
    </div>
  );
};

export default InvestmentFirmDashboard;
