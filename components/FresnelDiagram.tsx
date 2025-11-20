import React, { useState, useEffect, useRef } from 'react';
import { CircuitState, CircuitParams } from '../types';
import { Share2, Check, Info, Wand2 } from 'lucide-react';

interface FresnelDiagramProps {
  state: CircuitState;
  params: CircuitParams;
}

// Hook personnalisé pour interpoler l'état du circuit et créer une animation fluide
const useSmoothCircuitState = (targetState: CircuitState, duration: number = 400) => {
  const [displayState, setDisplayState] = useState(targetState);
  
  // On garde une référence à l'état de départ de l'animation
  const startStateRef = useRef(targetState);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    // Au changement de cible (targetState), on capture la position actuelle comme point de départ
    startStateRef.current = displayState; 
    startTimeRef.current = null;
    
    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing Cubic-Out pour un mouvement naturel
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextState = { ...targetState };
      
      // Interpolation de toutes les valeurs numériques
      (Object.keys(targetState) as (keyof CircuitState)[]).forEach((k) => {
         const key = k as keyof CircuitState;
         const s = startStateRef.current[key];
         const t = targetState[key];
         
         if (typeof s === 'number' && typeof t === 'number') {
             // @ts-ignore
             nextState[key] = s + (t - s) * ease;
         }
      });

      setDisplayState(nextState);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetState]); // Se déclenche quand les props changent

  return displayState;
};

const FresnelDiagram: React.FC<FresnelDiagramProps> = ({ state: targetState, params }) => {
  // Utilisation de l'état animé pour le rendu
  const state = useSmoothCircuitState(targetState);

  const [copied, setCopied] = useState(false);
  const [showPhiInfo, setShowPhiInfo] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);

  // Dimensions du SVG
  const width = 500;
  const height = 450;
  const padding = 50; // Marge confortable pour les étiquettes

  // --- 1. Calcul des dimensions du dessin en Volts (Bounding Box) ---
  // Largeur : Somme des vecteurs horizontaux UR et Ur
  const voltsWidth = state.UR_max + state.Ur_max;
  
  // Hauteur : Le dessin s'étend de +UL (vers le haut) à -(UC - UL) (vers le bas si UC > UL)
  // En mode expert, on veut aussi voir les vecteurs unitaires depuis l'origine, donc on prend le max absolu
  const voltsHeight = isExpertMode 
    ? Math.max(state.UL_max, state.UC_max) * 1.2 // Un peu plus d'espace pour le mode expert
    : Math.max(state.UL_max, state.UC_max);

  // --- 2. Calcul de l'échelle (pixels par Volt) ---
  const safeVoltsWidth = Math.max(voltsWidth, 0.1);
  const safeVoltsHeight = Math.max(voltsHeight, 0.1);

  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;

  const scaleX = availableWidth / safeVoltsWidth;
  const scaleY = availableHeight / safeVoltsHeight;
  
  // On choisit l'échelle la plus restrictive
  const scale = Math.min(scaleX, scaleY, 2000); 

  // --- 3. Calcul de la position de l'origine (x0, y0) pour centrer ---
  
  // Centrage Horizontal
  const drawWidth = voltsWidth * scale;
  const x0 = (width - drawWidth) / 2;

  // Centrage Vertical
  const pxAboveAxis = state.UL_max * scale;
  const pxBelowAxis = Math.max(0, state.UC_max - state.UL_max) * scale;
  
  // Ajustement du centrage si mode expert (car on dessine aussi UC depuis l'origine vers le bas)
  const expertPxBelow = state.UC_max * scale;
  
  const totalDrawHeight = isExpertMode 
    ? Math.max(pxAboveAxis, state.UL_max * scale) + Math.max(pxBelowAxis, expertPxBelow)
    : pxAboveAxis + pxBelowAxis;

  const yTop = (height - totalDrawHeight) / 2;
  const y0 = yTop + (isExpertMode ? Math.max(pxAboveAxis, state.UL_max * scale) : pxAboveAxis);

  // --- 4. Coordonnées des points du polygone de Fresnel ---
  const xA = x0 + state.UR_max * scale;
  const yA = y0;

  const xB = xA + state.Ur_max * scale;
  const yB = y0;

  const xC = xB;
  const yC = yB - state.UL_max * scale;

  const xD = xC;
  const yD = yC + state.UC_max * scale;

  const phiDeg = state.phi * 180 / Math.PI;

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('R', params.R.toString());
    url.searchParams.set('r', params.r.toString());
    url.searchParams.set('L', params.L.toString());
    url.searchParams.set('C', params.C.toString());
    url.searchParams.set('f', params.f.toString());
    url.searchParams.set('U_gen', params.U_gen.toString());
    
    // Mise à jour de l'URL du navigateur sans recharger
    window.history.pushState({}, '', url);
    
    // Copie dans le presse-papier
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const Arrow = ({ x1, y1, x2, y2, color, width=2, dashed=false, endArrow=true, opacity=1 }: any) => {
    const headLen = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    
    if (length < 1) return null;

    return (
      <g opacity={opacity}>
        <line 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke={color} 
          strokeWidth={width} 
          strokeDasharray={dashed ? "4,4" : "none"}
          strokeLinecap="round"
        />
        {endArrow && (
          <path
            d={`M ${x2} ${y2} L ${x2 - headLen * Math.cos(angle - Math.PI / 6)} ${y2 - headLen * Math.sin(angle - Math.PI / 6)} L ${x2 - headLen * Math.cos(angle + Math.PI / 6)} ${y2 - headLen * Math.sin(angle + Math.PI / 6)} Z`}
            fill={color}
          />
        )}
      </g>
    );
  };

  const Label = ({ x, y, text, color, anchor="middle", bg=true, fontSize="12" }: any) => (
    <g style={{ pointerEvents: 'none' }}>
      {bg && <rect x={x - 24} y={y - 10} width="48" height="20" fill="rgba(255,255,255,0.85)" rx="4" />}
      <text x={x} y={y} fill={color} fontSize={fontSize} fontWeight="bold" textAnchor={anchor} alignmentBaseline="middle">{text}</text>
    </g>
  );

  const MIN_PX_VISIBLE = 10;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md flex flex-col items-center relative">
      <div className="flex justify-between w-full items-center mb-2">
         <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            Construction de Fresnel
         </h3>
         <div className="flex items-center gap-2">
            <span className={`hidden sm:inline-block text-xs font-bold uppercase px-2 py-1 rounded border ${
              state.type === 'Inductif' ? 'text-blue-600 border-blue-200 bg-blue-50' :
              state.type === 'Capacitif' ? 'text-green-600 border-green-200 bg-green-50' :
              'text-purple-600 border-purple-200 bg-purple-50'
            }`}>
              {state.type === 'Résonance' ? 'Résistif' : state.type}
            </span>
            
            <button
              onClick={() => setIsExpertMode(!isExpertMode)}
              className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors border ${
                isExpertMode 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700' 
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
              title="Afficher les vecteurs complexes depuis l'origine"
            >
              <Wand2 size={14} />
              <span className="hidden sm:inline">Expert</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center justify-center p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors relative group"
              title="Copier le lien de la simulation"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
              {copied && (
                <span className="absolute top-full mt-1 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                  Lien copié !
                </span>
              )}
            </button>
         </div>
      </div>

      {/* --- Zone d'affichage des valeurs de tensions --- */}
      <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800/30 flex flex-col items-center">
          <span className="text-[10px] uppercase text-red-600 dark:text-red-300 font-bold">UR</span>
          <span className="text-sm font-mono font-bold text-red-700 dark:text-red-200">{state.UR_max.toFixed(1)}V</span>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-800/30 flex flex-col items-center">
          <span className="text-[10px] uppercase text-orange-600 dark:text-orange-300 font-bold">Ur</span>
          <span className="text-sm font-mono font-bold text-orange-700 dark:text-orange-200">{state.Ur_max.toFixed(1)}V</span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800/30 flex flex-col items-center">
          <span className="text-[10px] uppercase text-blue-600 dark:text-blue-300 font-bold">UL</span>
          <span className="text-sm font-mono font-bold text-blue-700 dark:text-blue-200">{state.UL_max.toFixed(1)}V</span>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-800/30 flex flex-col items-center border-dashed">
          <span className="text-[10px] uppercase text-orange-700 dark:text-orange-300 font-bold">U_bob</span>
          <span className="text-sm font-mono font-bold text-orange-800 dark:text-orange-100">{state.U_coil_max.toFixed(1)}V</span>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800/30 flex flex-col items-center">
          <span className="text-[10px] uppercase text-green-600 dark:text-green-300 font-bold">UC</span>
          <span className="text-sm font-mono font-bold text-green-700 dark:text-green-200">{state.UC_max.toFixed(1)}V</span>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-100 dark:border-purple-800/30 flex flex-col items-center">
          <span className="text-[10px] uppercase text-purple-600 dark:text-purple-300 font-bold">U_Tot</span>
          <span className="text-sm font-mono font-bold text-purple-700 dark:text-purple-200">{(state.Z * state.I_max).toFixed(1)}V</span>
        </div>
      </div>
      
      <svg width={width} height={height} className="overflow-visible bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 touch-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* Grille de fond */}
        <g opacity="0.05">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={i * height/10} x2={width} y2={i * height/10} stroke="currentColor" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * width/10} y1={0} x2={i * width/10} y2={height} stroke="currentColor" />
          ))}
        </g>

        {/* Axe horizontal de référence (I) */}
        <line x1={padding/2} y1={y0} x2={width - padding/2} y2={y0} stroke="#cbd5e1" strokeDasharray="4" />
        <text x={width - padding/2 + 5} y={y0} fill="#94a3b8" fontSize="12" alignmentBaseline="middle">I (réf)</text>
        <text x={width/2} y={y0 + height/2 - 10} fill="#94a3b8" fontSize="10" textAnchor="middle" opacity={0.5}>Imaginaire</text>
        <text x={width - 10} y={y0 - 10} fill="#94a3b8" fontSize="10" textAnchor="end" opacity={0.5}>Réel</text>

        {/* MODE EXPERT : Vecteurs depuis l'origine (Complexes indépendants) */}
        {isExpertMode && (
          <g>
            {/* UL pur (Vertical haut) */}
             <Arrow x1={x0} y1={y0} x2={x0} y2={y0 - state.UL_max * scale} color="#3b82f6" width={1.5} dashed={true} opacity={0.6} />
             <Label x={x0 - 15} y={y0 - state.UL_max * scale / 2} text="j·Lω·I" color="#3b82f6" fontSize="10" anchor="end" />
             
             {/* UC pur (Vertical bas) */}
             <Arrow x1={x0} y1={y0} x2={x0} y2={y0 + state.UC_max * scale} color="#10b981" width={1.5} dashed={true} opacity={0.6} />
             <Label x={x0 - 15} y={y0 + state.UC_max * scale / 2} text="-j·I/Cω" color="#10b981" fontSize="10" anchor="end" />

             {/* UR pur (Horizontal droite) */}
             {/* On le décale un tout petit peu vers le bas pour ne pas surcharger le vecteur principal */}
             <Arrow x1={x0} y1={y0+2} x2={x0 + state.UR_max * scale} y2={y0+2} color="#ef4444" width={1.5} dashed={true} opacity={0.5} />
             
             {/* Ur pur (Horizontal droite, décalé) */}
             <Arrow x1={x0} y1={y0+4} x2={x0 + state.Ur_max * scale} y2={y0+4} color="#f97316" width={1.5} dashed={true} opacity={0.5} />
          </g>
        )}

        {/* 1. Vecteur UR (Résistance R) - Partie du polygone */}
        <Arrow x1={x0} y1={y0} x2={xA} y2={yA} color="#ef4444" width={3} />
        {state.UR_max * scale > MIN_PX_VISIBLE && (
           <Label x={(x0 + xA)/2} y={y0 + 18} text="UR" color="#ef4444" />
        )}

        {/* 2. Vecteur Ur (Résistance interne bobine r) - Partie du polygone */}
        {state.Ur_max * scale > MIN_PX_VISIBLE && (
          <>
            <Arrow x1={xA} y1={yA} x2={xB} y2={yB} color="#f97316" width={2} dashed={!isExpertMode} />
            <Label x={(xA + xB)/2} y={y0 + 18} text="Ur" color="#f97316" />
          </>
        )}

        {/* 3. Vecteur UL (Inductance L) - Partie du polygone (Vertical) */}
        <Arrow x1={xB} y1={yB} x2={xC} y2={yC} color="#3b82f6" width={2} dashed={!isExpertMode} />
        <Label x={xB + 8} y={(yB + yC)/2} text="UL" color="#3b82f6" anchor="start" />

        {/* 4. Vecteur U_Bobine (Résultante r + L) - C'est l'hypoténuse Orange */}
        <Arrow x1={xA} y1={yA} x2={xC} y2={yC} color="#f97316" width={3} opacity={isExpertMode ? 0.4 : 1} />
        {state.U_coil_max * scale > 40 && !isExpertMode && (
          <text 
            x={(xA + xC)/2 - 8} 
            y={(yA + yC)/2 - 8} 
            fill="#f97316" 
            fontSize="12" 
            fontWeight="bold"
            textAnchor="end"
          >
            U_bob
          </text>
        )}

        {/* 5. Vecteur UC (Condensateur) - Part de la fin de UL et descend (Vert) */}
        <Arrow x1={xC} y1={yC} x2={xD} y2={yD} color="#10b981" width={3} />
        <Label x={xC + 8} y={(yC + yD)/2} text="UC" color="#10b981" anchor="start" />

        {/* 6. Vecteur U_Générateur (Total) - Ferme le polygone de O à D (Violet) */}
        <Arrow x1={x0} y1={y0} x2={xD} y2={yD} color="#8b5cf6" width={4} />
        <Label x={(x0 + xD)/2 - 10} y={(y0 + yD)/2} text="U_GBF" color="#8b5cf6" anchor="end" />

        {/* Arc pour le déphasage Phi */}
        {Math.abs(state.phi) > 0.05 && (
          <path
            d={`M ${x0 + 30} ${y0} A 30 30 0 0 ${state.phi > 0 ? 0 : 1} ${x0 + 30 * Math.cos(state.phi)} ${y0 - 30 * Math.sin(state.phi)}`}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
            opacity="0.8"
          />
        )}
        
        {/* Valeur de Phi - Interactive */}
        <g 
          onClick={(e) => { e.stopPropagation(); setShowPhiInfo(!showPhiInfo); }} 
          className="cursor-pointer hover:opacity-80 group"
          role="button"
          aria-label="Afficher l'explication du déphasage"
        >
          <text 
            x={x0 + 50} 
            y={y0 - 15 * Math.sign(state.phi) + 4} 
            fill="#8b5cf6" 
            fontSize="14" 
            fontWeight="bold"
            style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}
          >
            φ={phiDeg.toFixed(0)}°
          </text>
          {/* Zone de clic étendue invisible */}
          <rect 
            x={x0 + 40} 
            y={y0 - 15 * Math.sign(state.phi) - 10} 
            width="70" 
            height="30" 
            fill="transparent" 
          />
          
          {/* Indicateur visuel (icone info) qui apparait au survol si non affiché */}
          {!showPhiInfo && (
            <g transform={`translate(${x0 + 105}, ${y0 - 15 * Math.sign(state.phi)})`} className="opacity-0 group-hover:opacity-100 transition-opacity">
               <circle r="8" fill="#8b5cf6" opacity="0.2" />
               <text textAnchor="middle" dy="3" fill="#8b5cf6" fontSize="10" fontWeight="bold">?</text>
            </g>
          )}
        </g>

        {/* Infobulle Explicative (HTML dans SVG) */}
        {showPhiInfo && (
          <foreignObject x={x0 + 80} y={y0 - 80} width="240" height="140" style={{overflow: 'visible'}}>
            <div xmlns="http://www.w3.org/1999/xhtml" className="bg-slate-900/95 backdrop-blur text-slate-50 text-xs p-3 rounded-lg shadow-xl border border-slate-600 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-1">
                 <strong className="text-indigo-300 flex items-center gap-1">
                   <Info size={12} /> Déphasage (φ)
                 </strong>
                 <button onClick={(e) => {e.stopPropagation(); setShowPhiInfo(false)}} className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-700 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
              </div>
              <p className="mb-2 leading-relaxed opacity-90">C'est l'écart angulaire entre la tension totale et le courant.</p>
              <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                <li className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                   <span>φ &gt; 0 : Inductif (U en avance)</span>
                </li>
                <li className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                   <span>φ &lt; 0 : Capacitif (U en retard)</span>
                </li>
                <li className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                   <span>φ = 0 : Résonance (En phase)</span>
                </li>
              </ul>
            </div>
          </foreignObject>
        )}

        <line x1={xB} y1={y0} x2={xB} y2={yC} stroke="#94a3b8" strokeDasharray="2,2" opacity="0.3" />
        <line x1={x0} y1={yD} x2={xD} y2={yD} stroke="#94a3b8" strokeDasharray="2,2" opacity="0.3" />
      </svg>

      <div className="mt-4 w-full grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
         <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-2"></div>UR = R·I</div>
         <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 border border-dashed border-slate-600 mr-2 relative"><div className="absolute inset-0 border border-white opacity-20"></div></div>Ur = r·I</div>
         <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 border border-dashed border-slate-600 mr-2"></div>UL = Lω·I</div>
         <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>U_bobine</div>
         <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-2"></div>UC = I/Cω</div>
         <div className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>U_GBF (Somme)</div>
      </div>
    </div>
  );
};

export default FresnelDiagram;