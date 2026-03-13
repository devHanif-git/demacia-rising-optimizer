'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Shield, Sword, Users, AlertCircle } from 'lucide-react';

// --- Data Definitions ---

const ENEMY_TYPES = [
  'Drakehound',
  'Krug',
  'Tribal Warrior',
  'Troll',
  'Yeti',
  'Cloud Drake',
  'Noxian Infantry',
  'Noxian Drakehound',
  'Noxian Battlemage',
  'Basilisk',
  'Noxian Mauler'
];

const ENEMY_DATA: Record<string, { tags: string[], threatPerUnit: number }> = {
  'Drakehound': { tags: ['needs_aoe', 'assassin'], threatPerUnit: 4 },
  'Krug': { tags: ['heavy_armor', 'anti_melee'], threatPerUnit: 6 },
  'Tribal Warrior': { tags: ['needs_aoe', 'anti_ranged', 'assassin'], threatPerUnit: 5 },
  'Troll': { tags: ['ranged'], threatPerUnit: 5 },
  'Yeti': { tags: ['ranged', 'aoe_threat', 'bruiser'], threatPerUnit: 8 },
  'Cloud Drake': { tags: ['boss', 'aoe_threat', 'anti_light'], threatPerUnit: 25 },
  'Noxian Infantry': { tags: ['needs_aoe', 'anti_guard'], threatPerUnit: 2 },
  'Noxian Drakehound': { tags: ['needs_aoe', 'assassin'], threatPerUnit: 4 },
  'Noxian Battlemage': { tags: ['ranged', 'anti_tank', 'weak_to_ranged'], threatPerUnit: 7 },
  'Basilisk': { tags: ['anti_ranged', 'heavy_armor', 'weak_to_ranger'], threatPerUnit: 15 },
  'Noxian Mauler': { tags: ['bruiser', 'anti_light', 'weak_to_hero'], threatPerUnit: 12 },
};

const CHAMPIONS = [
  'Poppy',
  'Galio',
  'Kayle',
  'Morgana',
  'Garen',
  'Sona',
  'Quinn',
  'Jarvan IV',
];

const CHAMPION_DATA: Record<string, string[]> = {
  'Poppy': ['boss', 'bruiser', 'anti_melee'],
  'Galio': ['assassin', 'anti_ranged', 'needs_aoe'],
  'Kayle': ['heavy_armor', 'bruiser', 'boss'],
  'Morgana': ['needs_aoe', 'anti_ranged', 'assassin'],
  'Garen': ['needs_aoe', 'anti_guard', 'anti_light'],
  'Sona': ['needs_aoe', 'ranged'],
  'Quinn': ['ranged', 'weak_to_ranged', 'assassin'],
  'Jarvan IV': ['boss', 'anti_tank', 'weak_to_hero'],
};

const PLAYER_UNITS = [
  'Guard',
  'Archer',
  'Soldier',
  'Ranger',
];

const UNIT_DATA: Record<string, string[]> = {
  'Guard': ['assassin', 'anti_ranged', 'ranged'],
  'Archer': ['needs_aoe', 'weak_to_ranged'],
  'Soldier': ['anti_light', 'bruiser', 'anti_tank'],
  'Ranger': ['heavy_armor', 'boss', 'weak_to_ranger'],
};

// --- Types ---

interface EnemyInput {
  id: string;
  type: string;
  count: number;
}

interface DefensePlan {
  units: Record<string, number>;
  champions: string[];
  totalSlots: number;
}

export default function DemaciaRisingOptimizer() {
  // --- State ---
  const [maxSlots, setMaxSlots] = useState<number>(7);
  const [unlockedChampions, setUnlockedChampions] = useState<string[]>([
    'Poppy', 'Galio', 'Kayle', 'Morgana'
  ]);
  const [enemies, setEnemies] = useState<EnemyInput[]>([
    { id: '1', type: 'Noxian Drakehound', count: 3 },
    { id: '2', type: 'Noxian Infantry', count: 15 },
    { id: '3', type: 'Basilisk', count: 1 },
  ]);
  
  const [planWithChamps, setPlanWithChamps] = useState<DefensePlan | null>(null);
  const [planNoChamps, setPlanNoChamps] = useState<DefensePlan | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // --- Load/Save Settings ---
  useEffect(() => {
    const savedSlots = localStorage.getItem('demacia_maxSlots');
    if (savedSlots) setMaxSlots(parseInt(savedSlots, 10));

    const savedChamps = localStorage.getItem('demacia_unlockedChampions');
    if (savedChamps) setUnlockedChampions(JSON.parse(savedChamps));

    const savedEnemies = localStorage.getItem('demacia_enemies');
    if (savedEnemies) setEnemies(JSON.parse(savedEnemies));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('demacia_maxSlots', maxSlots.toString());
  }, [maxSlots]);

  useEffect(() => {
    localStorage.setItem('demacia_unlockedChampions', JSON.stringify(unlockedChampions));
  }, [unlockedChampions]);

  useEffect(() => {
    localStorage.setItem('demacia_enemies', JSON.stringify(enemies));
  }, [enemies]);

  // --- Handlers ---
  const handleAddEnemy = () => {
    setEnemies([...enemies, { id: Date.now().toString(), type: ENEMY_TYPES[0], count: 1 }]);
  };

  const handleRemoveEnemy = (id: string) => {
    setEnemies(enemies.filter(e => e.id !== id));
  };

  const handleEnemyChange = (id: string, field: keyof EnemyInput, value: string | number) => {
    setEnemies(enemies.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const toggleChampion = (champ: string) => {
    setUnlockedChampions(prev => 
      prev.includes(champ) ? prev.filter(c => c !== champ) : [...prev, champ]
    );
  };

  // --- Calculation Logic (Tag-based Heuristic) ---
  const calculateDefense = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      // 1. Calculate total threat per tag
      const tagThreats: Record<string, number> = {};
      enemies.forEach(enemy => {
        const data = ENEMY_DATA[enemy.type];
        if (data) {
          const threat = data.threatPerUnit * enemy.count;
          data.tags.forEach(tag => {
            tagThreats[tag] = (tagThreats[tag] || 0) + threat;
          });
        }
      });

      // 2. Score Champions
      const champScores: { name: string, score: number }[] = [];
      unlockedChampions.forEach(champ => {
        const tags = CHAMPION_DATA[champ] || [];
        const score = tags.reduce((sum, tag) => sum + (tagThreats[tag] || 0), 0);
        champScores.push({ name: champ, score });
      });
      champScores.sort((a, b) => b.score - a.score);

      // 3. Score Units
      const unitScores: Record<string, number> = {};
      let totalUnitScore = 0;
      PLAYER_UNITS.forEach(unit => {
        const tags = UNIT_DATA[unit] || [];
        const score = tags.reduce((sum, tag) => sum + (tagThreats[tag] || 0), 0);
        unitScores[unit] = score;
        totalUnitScore += score;
      });

      // Helper to allocate slots using Largest Remainder Method
      const allocateSlots = (availableSlots: number): Record<string, number> => {
        const allocation: Record<string, number> = { Guard: 0, Archer: 0, Soldier: 0, Ranger: 0 };
        if (totalUnitScore === 0) {
          // Fallback if no specific threats
          allocation['Guard'] = Math.floor(availableSlots / 2);
          allocation['Ranger'] = Math.ceil(availableSlots / 2);
          return allocation;
        }

        let allocated = 0;
        const remainders: { unit: string, remainder: number }[] = [];

        for (const unit of PLAYER_UNITS) {
          const exact = (unitScores[unit] / totalUnitScore) * availableSlots;
          allocation[unit] = Math.floor(exact);
          allocated += allocation[unit];
          remainders.push({ unit, remainder: exact - Math.floor(exact) });
        }

        remainders.sort((a, b) => b.remainder - a.remainder);
        for (let i = 0; i < availableSlots - allocated; i++) {
          allocation[remainders[i].unit]++;
        }
        return allocation;
      };

      // --- Plan 1: With Champions ---
      // Pick up to 3 best champions, or fewer if maxSlots is very low
      const maxChamps = Math.min(3, Math.max(0, maxSlots - 2)); 
      const selectedChamps = champScores.slice(0, maxChamps).filter(c => c.score > 0).map(c => c.name);
      
      // If no threats, just pick some champs
      if (selectedChamps.length === 0 && totalUnitScore === 0) {
        selectedChamps.push(...unlockedChampions.slice(0, maxChamps));
      }

      const slotsForUnitsWithChamps = maxSlots - selectedChamps.length;
      const unitsWithChamps = allocateSlots(slotsForUnitsWithChamps);

      setPlanWithChamps({
        units: unitsWithChamps,
        champions: selectedChamps,
        totalSlots: maxSlots
      });

      // --- Plan 2: Without Champions ---
      const unitsNoChamps = allocateSlots(maxSlots);
      
      setPlanNoChamps({
        units: unitsNoChamps,
        champions: [],
        totalSlots: maxSlots
      });
      
      setIsCalculating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            Demacia Rising Optimizer
          </h1>
          <p className="text-slate-400 mt-2">Calculate the optimal unit composition to defend against incoming attacks.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Enemy Input Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-rose-400">
                  <Sword className="w-5 h-5" />
                  Incoming Attack
                </h2>
                <button 
                  onClick={handleAddEnemy}
                  className="text-sm flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Enemy
                </button>
              </div>

              <div className="space-y-3">
                {enemies.length === 0 ? (
                  <p className="text-slate-500 text-center py-4 italic">No enemies added. Click &quot;Add Enemy&quot; to start.</p>
                ) : (
                  enemies.map((enemy, index) => (
                    <div key={enemy.id} className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                      <div className="flex-1">
                        <select 
                          value={enemy.type}
                          onChange={(e) => handleEnemyChange(enemy.id, 'type', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        >
                          {ENEMY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          min="1"
                          value={enemy.count}
                          onChange={(e) => handleEnemyChange(enemy.id, 'count', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveEnemy(enemy.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Settings Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-amber-400 mb-6">
                <Settings className="w-5 h-5" />
                Configuration
              </h2>
              
              <div className="space-y-6">
                {/* Max Slots */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Available Training Slots (Max 8)
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="8" 
                      value={maxSlots}
                      onChange={(e) => setMaxSlots(parseInt(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="bg-slate-800 text-amber-400 font-mono px-3 py-1 rounded-lg border border-slate-700">
                      {maxSlots} / 8
                    </span>
                  </div>
                </div>

                {/* Champions */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">
                    Unlocked Champions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CHAMPIONS.map(champ => {
                      const isUnlocked = unlockedChampions.includes(champ);
                      return (
                        <button
                          key={champ}
                          onClick={() => toggleChampion(champ)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                            isUnlocked 
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          {champ}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <button 
              onClick={calculateDefense}
              disabled={isCalculating || enemies.length === 0}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
            >
              {isCalculating ? (
                <span className="animate-pulse">Calculating Optimal Strategy...</span>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  Calculate Best Defense
                </>
              )}
            </button>

          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-5">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400 mb-6">
                <Users className="w-5 h-5" />
                Recommended Build
              </h2>

              {!planWithChamps && !planNoChamps ? (
                <div className="flex-1 bg-slate-950/50 border border-slate-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center text-slate-500 min-h-[400px]">
                  <Shield className="w-16 h-16 mb-4 opacity-20" />
                  <p>Enter the incoming attack and click calculate to see the optimal defense strategy.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                  
                  {/* With Champions */}
                  {planWithChamps && (
                    <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        BEST OPTION
                      </div>
                      <h3 className="text-lg font-semibold text-amber-400 mb-4">With Champions</h3>
                      
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(planWithChamps.units).map(([unit, count]) => (
                            count > 0 && (
                              <div key={unit} className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <span className="text-slate-300">{unit}</span>
                                <span className="bg-slate-800 text-slate-400 text-xs px-1.5 py-0.5 rounded font-mono">x{count}</span>
                              </div>
                            )
                          ))}
                          {planWithChamps.champions.map(champ => (
                            <div key={champ} className="bg-amber-950/30 border border-amber-700/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                              <span className="text-amber-200 font-medium">{champ}</span>
                              <span className="bg-amber-900/50 text-amber-400/70 text-xs px-1.5 py-0.5 rounded font-mono">Champ</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center text-sm">
                          <span className="text-slate-400">Slots Used:</span>
                          <span className="text-slate-200 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700">
                            {Object.values(planWithChamps.units).reduce((a, b) => a + b, 0) + planWithChamps.champions.length} / {maxSlots}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Without Champions */}
                  {planNoChamps && (
                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-slate-300 mb-4">Without Champions</h3>
                      
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(planNoChamps.units).map(([unit, count]) => (
                            count > 0 && (
                              <div key={unit} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <span className="text-slate-400">{unit}</span>
                                <span className="bg-slate-950 text-slate-500 text-xs px-1.5 py-0.5 rounded font-mono">x{count}</span>
                              </div>
                            )
                          ))}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-sm">
                          <span className="text-slate-500">Slots Used:</span>
                          <span className="text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {Object.values(planNoChamps.units).reduce((a, b) => a + b, 0)} / {maxSlots}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
