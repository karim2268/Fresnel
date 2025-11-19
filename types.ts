export interface CircuitParams {
  R: number; // Resistance in Ohms (Resistor component)
  r: number; // Internal resistance of the Coil in Ohms
  L: number; // Inductance in Henries
  C: number; // Capacitance in Farads
  f: number; // Frequency in Hertz
  U_gen: number; // Generator Voltage Amplitude (Volts)
}

export interface CircuitState {
  omega: number;      // Angular frequency (rad/s)
  XL: number;         // Inductive Reactance (Ohms)
  XC: number;         // Capacitive Reactance (Ohms)
  Z: number;          // Total Impedance (Ohms)
  I_max: number;      // Current Amplitude (Amps)
  phi: number;        // Phase shift (radians)
  UR_max: number;     // Voltage across R (Resistor)
  Ur_max: number;     // Voltage across r (Internal resistance of coil)
  UL_max: number;     // Voltage across L (Inductive part)
  U_coil_max: number; // Voltage across the real Coil (sqrt(Ur^2 + UL^2))
  UC_max: number;     // Voltage across C
  resonanceFreq: number; // Resonant frequency (Hz)
  type: 'Inductif' | 'Capacitif' | 'Résonance';
}

export interface TimeDataPoint {
  time: number;
  u_source: number;
  i_scaled: number; // Scaled for visualization
  u_R: number;
  u_coil: number; // Real voltage across the coil
  u_C: number;
}