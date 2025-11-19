import { CircuitParams, CircuitState, TimeDataPoint } from '../types';

export const calculateCircuitState = (params: CircuitParams): CircuitState => {
  const { R, r, L, C, f, U_gen } = params;
  const omega = 2 * Math.PI * f;
  
  const XL = L * omega;
  const XC = 1 / (C * omega);
  
  // Total Resistance = R (resistor) + r (coil internal)
  const R_total = R + r;

  // Impedance Z = sqrt(R_total^2 + (XL - XC)^2)
  const reactanceDiff = XL - XC;
  const Z = Math.sqrt(R_total * R_total + reactanceDiff * reactanceDiff);
  
  // Current Amplitude I_max = U_gen / Z
  const I_max = Z === 0 ? 0 : U_gen / Z; // Avoid division by zero
  
  // Phase shift phi = atan((XL - XC) / R_total)
  const phi = Math.atan2(reactanceDiff, R_total);
  
  // Component Voltages (Amplitudes)
  const UR_max = R * I_max;
  const Ur_max = r * I_max; // Internal resistance voltage
  const UL_max = XL * I_max;
  const UC_max = XC * I_max;

  // Real Coil Voltage Amplitude (Vector sum of Ur and UL)
  const U_coil_max = Math.sqrt(Ur_max * Ur_max + UL_max * UL_max);

  // Resonance Frequency f0 = 1 / (2*pi*sqrt(LC))
  // Note: Series resonance frequency depends only on L and C, r affects the Q factor (sharpness).
  const resonanceFreq = 1 / (2 * Math.PI * Math.sqrt(L * C));

  let type: CircuitState['type'] = 'Résonance';
  // Use a tolerance of 1% or 0.5 Hz, whichever is larger, to make it easier to hit resonance
  const tolerance = Math.max(0.5, resonanceFreq * 0.01);
  
  if (Math.abs(f - resonanceFreq) < tolerance) {
    type = 'Résonance';
  } else if (f < resonanceFreq) {
    type = 'Capacitif';
  } else {
    type = 'Inductif';
  }

  return {
    omega,
    XL,
    XC,
    Z,
    I_max,
    phi,
    UR_max,
    Ur_max,
    UL_max,
    U_coil_max,
    UC_max,
    resonanceFreq,
    type
  };
};

export const generateWaveforms = (params: CircuitParams, state: CircuitState, points: number = 100): TimeDataPoint[] => {
  const data: TimeDataPoint[] = [];
  const period = 1 / params.f;
  // Show 2 periods
  const duration = 2 * period; 
  
  // Calculate phase of the real coil voltage relative to current
  // tan(phi_coil) = UL / Ur = (L*omega)/r
  // If r is 0, phase is PI/2.
  const phi_coil = params.r === 0 ? Math.PI / 2 : Math.atan2(state.UL_max, state.Ur_max);

  for (let i = 0; i <= points; i++) {
    const t = (i / points) * duration;
    const angle = state.omega * t;
    
    // Reference: Current i(t) = I_max * sin(omega * t) (Phase 0)
    const i_val = state.I_max * Math.sin(angle);
    
    // Source Voltage u(t) = U_gen * sin(omega * t + phi)
    const u_source = params.U_gen * Math.sin(angle + state.phi);
    
    // u_R is in phase with i
    const u_R = state.UR_max * Math.sin(angle);
    
    // u_coil (Real Coil) leads i by phi_coil
    const u_coil = state.U_coil_max * Math.sin(angle + phi_coil);
    
    // u_C lags i by 90 deg (-pi/2)
    const u_C = state.UC_max * Math.sin(angle - Math.PI / 2);

    // Scale current for visualization
    const i_scaled = i_val * (state.Z > 0 ? state.Z : 1);

    data.push({
      time: t * 1000, // ms
      u_source,
      i_scaled: i_val, 
      u_R,
      u_coil,
      u_C
    });
  }
  return data;
};