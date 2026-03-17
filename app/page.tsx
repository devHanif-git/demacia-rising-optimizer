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
  'Tribal Warrior': { tags: ['needs_aoe', 'anti_ranged', 'anti_ranged_hard_counter', 'assassin'], threatPerUnit: 7 }, // Strong anti-ranged
  'Troll': { tags: ['ranged'], threatPerUnit: 5 },
  'Yeti': { tags: ['ranged', 'aoe_threat', 'bruiser'], threatPerUnit: 8 },
  'Cloud Drake': { tags: ['boss', 'aoe_threat', 'anti_light'], threatPerUnit: 25 },
  'Noxian Infantry': { tags: ['needs_aoe', 'anti_guard'], threatPerUnit: 2 },
  'Noxian Drakehound': { tags: ['needs_aoe', 'assassin', 'anti_ranged'], threatPerUnit: 4 },
  'Noxian Battlemage': { tags: ['ranged', 'anti_tank', 'weak_to_ranged'], threatPerUnit: 7 },
  'Basilisk': { tags: ['anti_ranged', 'anti_ranged_hard_counter', 'heavy_armor', 'weak_to_ranger', 'slow_movement'], threatPerUnit: 15 }, // Strong anti-ranged but slow
  'Noxian Mauler': { tags: ['bruiser', 'anti_light', 'weak_to_hero', 'weak_to_ranger'], threatPerUnit: 12 },
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
  'Galio': ['assassin', 'anti_ranged', 'needs_aoe', 'anti_ranged_hard_counter'],
  'Kayle': ['heavy_armor', 'bruiser', 'boss'],
  'Morgana': ['needs_aoe', 'anti_ranged', 'assassin'],
  'Garen': ['needs_aoe', 'anti_guard', 'anti_light'],
  'Sona': ['needs_aoe', 'ranged', 'healer', 'support'],
  'Quinn': ['ranged', 'weak_to_ranger', 'assassin', 'anti_ranged'], // Ranged sniper for "far away units"
  'Jarvan IV': ['boss', 'anti_tank', 'bruiser', 'support'], // Melee inspirer
};

const PLAYER_UNITS = [
  'Guard',
  'Archer',
  'Soldier',
  'Ranger',
];

const UNIT_DATA: Record<string, string[]> = {
  'Guard': ['assassin', 'anti_ranged', 'ranged', 'anti_ranged_hard_counter'],
  'Archer': ['needs_aoe', 'weak_to_ranged', 'slow_movement'],
  'Soldier': ['anti_light', 'bruiser', 'anti_tank', 'anti_melee'],
  'Ranger': ['heavy_armor', 'boss', 'weak_to_ranger', 'slow_movement'],
};

const CHAMPION_EQUIVALENTS: Record<string, string> = {
  'Poppy': 'Soldier',
  'Galio': 'Soldier',
  'Garen': 'Guard',
  'Kayle': 'Guard',
  'Morgana': 'Archer',
  'Sona': 'Archer',
  'Quinn': 'Ranger',
  'Jarvan IV': 'Soldier', // Corrected to a melee equivalent since he is a melee champion
};

const UNIVERSAL_RATIO: Record<string, number> = {
  'Soldier': 2,
  'Guard': 2,
  'Archer': 2,
  'Ranger': 1,
};
const UNIVERSAL_RATIO_TOTAL = 7;

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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

  // --- Calculation Logic (Targeting & Tag Heuristic) ---
  const getUnitIcon = (name: string) => {
    const override: Record<string, string> = {
      'Cloud Drake': 'https://wiki.leagueoflegends.com/en-us/Special:FilePath/Cloud_Drake_DR_Sprite.png',
      'Guard': 'https://wiki.leagueoflegends.com/en-us/images/thumb/Guard_DR_Sprite_01.png/53px-Guard_DR_Sprite_01.png?31a7a',
      'Archer': 'https://wiki.leagueoflegends.com/en-us/images/thumb/Archer_DR_Sprite_01.png/53px-Archer_DR_Sprite_01.png?efa73',
      'Soldier': 'https://wiki.leagueoflegends.com/en-us/images/thumb/Soldier_DR_Sprite_01.png/53px-Soldier_DR_Sprite_01.png?32556',
      'Ranger': 'https://wiki.leagueoflegends.com/en-us/images/thumb/Ranger_DR_Sprite_01.png/53px-Ranger_DR_Sprite_01.png?631b5'
    };
    if (override[name]) return override[name];
    
    const fileName = `${name.replace(/\s+/g, '_')}_DR_Sprite.png`;
    return `https://wiki.leagueoflegends.com/en-us/images/thumb/${fileName}/53px-${fileName}`;
  };

  const calculateDefense = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      // 1. Calculate total threat per tag
      const tagThreats: Record<string, number> = {};
      let totalThreatVolume = 0;
      
      enemies.forEach(enemy => {
        const data = ENEMY_DATA[enemy.type];
        if (data) {
          const expectedThreat = data.threatPerUnit * enemy.count;
          totalThreatVolume += expectedThreat;
          
          data.tags.forEach(tag => {
            tagThreats[tag] = (tagThreats[tag] || 0) + expectedThreat;
          });
        }
      });

      // 2. Adjust for Hard Counters (Anti-Ranged Pressure vs Ranger Necessity)
      const antiRangedPressure = tagThreats['anti_ranged_hard_counter'] || 0;
      const isRangedDangerous = antiRangedPressure > (totalThreatVolume * 0.2); // If 20%+ of threat directly hunts ranged
      
      // EXCEPTION: Are slow, highly-armored, or shielded units present? 
      // If Basilisk or Noxian Mauler exist, we *must* have Rangers even if Tribal Warriors are present.
      const rangerNecessity = (tagThreats['slow_movement'] || 0) + (tagThreats['weak_to_ranger'] || 0);
      const requiresRangers = rangerNecessity > 0;

      // 3. Score Champions
      const champScores: { name: string, score: number }[] = [];
      unlockedChampions.forEach(champ => {
        const tags = CHAMPION_DATA[champ] || [];
        let score = tags.reduce((sum, tag) => sum + (tagThreats[tag] || 0), 0);

        // --- Global Champion Modifiers ---
        // Bonus for enemies weak to heroes
        score += (tagThreats['weak_to_hero'] || 0) * 1.5;

        // Penalty for Tank/Melee heroes if heavy anti-tank/anti-melee threat exists
        const antiTankThreat = (tagThreats['anti_tank'] || 0) + (tagThreats['anti_melee'] || 0);
        const isTankDangerous = antiTankThreat > (totalThreatVolume * 0.15);
        if (isTankDangerous && ['Poppy', 'Garen', 'Galio', 'Jarvan IV', 'Kayle'].includes(champ)) {
           score -= antiTankThreat * 1.5;
        }
        
        // --- Custom Champion Synergies ---
        if (champ === 'Sona') {
          // Sona is a support champion that heals allied units.
          // Her base healing value scales with the size of the army (slots) and total incoming damage (threat).
          score += (maxSlots * 1.2) + (totalThreatVolume * 0.15);
          
          // She also synergizes well when building heavy ranged compositions
          score += (tagThreats['weak_to_ranged'] || 0) * 0.8;
          score += (tagThreats['weak_to_ranger'] || 0) * 0.8;
          
          if (isRangedDangerous) {
            // Because she is ranged herself, massive anti-ranged pressure still reduces her survivability/value
            score -= (antiRangedPressure * 0.3);
          }
        }

        if (champ === 'Jarvan IV') {
          // Jarvan IV is a melee champion who inspires allies.
          // His buffing presence means his value scales strongly with army size.
          score += (maxSlots * 1.5);
          
          // Being melee, he can be countered slightly by heavy anti-melee frontline, but not as severely as typical frontliners due to his buffs
          score -= (tagThreats['anti_melee'] || 0) * 0.1;
        }

        if (champ === 'Quinn') {
          // Quinn sends Valor to damage "far away units", acting as an exceptional sniper.
          // Her value skyrockets when the enemy brings high-value ranged threats (like Trolls or Battlemages).
          score += (tagThreats['ranged'] || 0) * 1.5;
          score += (tagThreats['assassin'] || 0) * 0.5; // Good at taking out squishy high-value targets
          
          if (isRangedDangerous) {
            // She is still ranged, and vulnerable to extreme anti-ranged diving units
            score -= (antiRangedPressure * 0.3);
          }
        }
        
        champScores.push({ name: champ, score });
      });
      champScores.sort((a, b) => b.score - a.score);

      // 4. Calculate Base Universal Composition
      const getBaseUniversalUnits = (slots: number): Record<string, number> => {
        const allocation: Record<string, number> = { Guard: 0, Archer: 0, Soldier: 0, Ranger: 0 };
        let allocated = 0;
        const remainders: { unit: string, remainder: number }[] = [];

        for (const unit of PLAYER_UNITS) {
          const exact = (UNIVERSAL_RATIO[unit] / UNIVERSAL_RATIO_TOTAL) * slots;
          allocation[unit] = Math.floor(exact);
          allocated += allocation[unit];
          remainders.push({ unit, remainder: exact - Math.floor(exact) });
        }

        remainders.sort((a, b) => b.remainder - a.remainder);
        for (let i = 0; i < slots - allocated; i++) {
          allocation[remainders[i].unit]++;
        }
        return allocation;
      };

      // Apply Threat Overrides to a composition
      const applyThreatOverrides = (comp: Record<string, number>) => {
        const isTankDangerous = (tagThreats['anti_tank'] || 0) + (tagThreats['anti_melee'] || 0) > (totalThreatVolume * 0.15);

        // 1. Anti-Ranged Pressure (Transfer Archer to Frontline)
        if (isRangedDangerous && !isTankDangerous) {
          const archerCount = comp['Archer'];
          comp['Archer'] = 0;
          comp['Guard'] += Math.ceil(archerCount / 2);
          comp['Soldier'] += Math.floor(archerCount / 2);
        }

        // 2. Anti-Tank Pressure (Transfer Frontline to Backline)
        if (isTankDangerous) {
          const guardCount = comp['Guard'];
          const soldierCount = comp['Soldier'];
          comp['Guard'] = 0;
          comp['Soldier'] = 0;
          comp['Archer'] += Math.ceil((guardCount + soldierCount) / 2);
          comp['Ranger'] += Math.floor((guardCount + soldierCount) / 2);
        }

        // 3. Ranger Necessity (Independent of Ranged danger)
        if (requiresRangers) {
          // E.g. every 10 threat volume needs 1 Ranger
          let neededRangers = Math.max(1, Math.ceil(rangerNecessity / 10));
          if (neededRangers > comp['Ranger']) {
             let deficit = neededRangers - comp['Ranger'];
             const order = ['Guard', 'Soldier', 'Archer']; // Drain units in this order to fund Rangers
             for (const unit of order) {
                while (deficit > 0 && comp[unit] > 0) {
                   comp[unit]--;
                   comp['Ranger']++;
                   deficit--;
                }
             }
          }
        } else if (isRangedDangerous && !isTankDangerous) {
          // If ranged is dangerous but tank is not, and no rangers are required, remove rangers
          const rangerCount = comp['Ranger'];
          comp['Ranger'] = 0;
          comp['Soldier'] += rangerCount;
        }

        return comp;
      };

      // --- Plan 2: Without Champions ---
      let unitsNoChamps = getBaseUniversalUnits(maxSlots);
      if (totalThreatVolume > 0) {
         unitsNoChamps = applyThreatOverrides(unitsNoChamps);
      }

      setPlanNoChamps({
        units: unitsNoChamps,
        champions: [],
        totalSlots: maxSlots
      });

      // --- Plan 1: With Champions ---
      const maxChamps = Math.min(3, Math.max(0, maxSlots - 2)); 
      const selectedChamps = champScores.slice(0, maxChamps).filter(c => c.score > 0).map(c => c.name);
      if (selectedChamps.length === 0 && totalThreatVolume === 0) {
        selectedChamps.push(...unlockedChampions.slice(0, maxChamps));
      }

      // We determine the best units by generating an ideal maxSlots composition and subtracting the chosen champions
      let idealFullUnits = getBaseUniversalUnits(maxSlots);
      if (totalThreatVolume > 0) {
         idealFullUnits = applyThreatOverrides(idealFullUnits);
      }

      // Subtract equivalents for chosen champions
      for (const champ of selectedChamps) {
        const equiv = CHAMPION_EQUIVALENTS[champ];
        if (idealFullUnits[equiv] > 0) {
          idealFullUnits[equiv]--;
        } else {
          // If the exact equivalent is 0, subtract from highest available bucket to make room
          const availableUnits = Object.entries(idealFullUnits).filter(([u, c]) => c > 0);
          if (availableUnits.length > 0) {
             availableUnits.sort((a, b) => b[1] - a[1]);
             idealFullUnits[availableUnits[0][0]]--;
          }
        }
      }

      setPlanWithChamps({
        units: idealFullUnits,
        champions: selectedChamps,
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
                    <div key={enemy.id} className={`flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 ${openDropdownId === enemy.id ? 'relative z-50' : 'relative z-0'}`}>
                      <div className="flex-1 relative z-10 w-full col-span-2 sm:col-span-1">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === enemy.id ? null : enemy.id)}
                          className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-3 pr-3 py-2 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 flex-shrink-0 rounded-md bg-slate-800/80 overflow-hidden flex items-center justify-center border border-slate-700/50 shadow-inner">
                              <img src={getUnitIcon(enemy.type)} alt={enemy.type} className="w-full h-full object-contain drop-shadow-md" style={{ imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <span className="truncate">{enemy.type}</span>
                          </div>
                          <span className="text-slate-500 text-xs ml-2">▼</span>
                        </button>

                        {/* Custom Dropdown Menu */}
                        {openDropdownId === enemy.id && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                            {ENEMY_TYPES.map(t => (
                              <button
                                key={t}
                                onClick={() => {
                                  handleEnemyChange(enemy.id, 'type', t);
                                  setOpenDropdownId(null);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors ${enemy.type === t ? 'bg-amber-500/10 text-amber-400' : 'text-slate-200'}`}
                              >
                                <div className="w-8 h-8 flex-shrink-0 rounded-md bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                                  <img src={getUnitIcon(t)} alt={t} className="w-full h-full object-contain drop-shadow-md" style={{ imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                                <span className="truncate">{t}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          min="1"
                          value={enemy.count || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleEnemyChange(enemy.id, 'count', val === '' ? 0 : parseInt(val, 10));
                          }}
                          onBlur={(e) => {
                            if (!enemy.count || enemy.count < 1) {
                              handleEnemyChange(enemy.id, 'count', 1);
                            }
                          }}
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
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                            isUnlocked 
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                           <img 
                             src={getUnitIcon(champ)} 
                             alt={champ}
                             style={{ imageRendering: 'pixelated' }}
                             className={`w-8 h-8 object-contain drop-shadow-md ${!isUnlocked && 'opacity-50 grayscale'}`}
                             onError={(e) => { e.currentTarget.style.display = 'none'; }}
                           />
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
                              <div key={unit} className="bg-slate-900 border border-slate-700 pl-2 pr-3 py-1.5 rounded-lg flex items-center gap-2">
                                <img src={getUnitIcon(unit)} alt={unit} className="w-6 h-6 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <span className="text-slate-300 ml-1">{unit}</span>
                                <span className="bg-slate-800 text-slate-400 text-xs px-1.5 py-0.5 rounded font-mono">x{count}</span>
                              </div>
                            )
                          ))}
                          {planWithChamps.champions.map(champ => (
                            <div key={champ} className="bg-amber-950/30 border border-amber-700/50 pl-2 pr-3 py-1.5 rounded-lg flex items-center gap-2">
                              <img src={getUnitIcon(champ)} alt={champ} className="w-6 h-6 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              <span className="text-amber-200 font-medium ml-1">{champ}</span>
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
                              <div key={unit} className="bg-slate-900 border border-slate-800 pl-2 pr-3 py-1.5 rounded-lg flex items-center gap-2">
                                <img src={getUnitIcon(unit)} alt={unit} className="w-6 h-6 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <span className="text-slate-400 ml-1">{unit}</span>
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
