% ========================================================================
% ========================================================================
% ========================================================================
% ========================================================================
% ====================     SRI LANKA POWER MODEL   =======================
% ========================================================================
% ========================================================================
% ========================================================================
% ========================================================================
% ========================================================================


t_dist = 200;
rocof_meas_window = 0.18 ;


%% Global System Values
f_base = 50;           % Nominal frequency in Hz
S_base_sys = 1000e6;   % 1000 MVA System Base for CEB Grid
D_T = 1500e6/S_base_sys;             % Total system damping



%% Hashan

%% 1. LAKVIJAYA POWER PLANT START ===========================================

% Lakvijaya Coal Power Plant (Reheat Steam Unit) Parameters

% 1. Power and Grid Integration
LAK_S_nom = 300e6;   % Nominal Capacity: 300 MVA (One unit)
LAK_H = 3.0;         % Inertia Constant: 3.0 seconds (Heavy coal rotor)
LAK_R = 0.04;        % Droop Setting: 4% (Standard CEB grid compliance)

% 2. Governor and Turbine Time Constants
RHT_F_HP = 0.3;      % High-Pressure (HP) turbine power fraction
RHT_T_RH = 7.0;      % Reheater time constant (Massive steam delay)
RHT_T_CH = 0.3;      % Steam chest time constant

Pref_Set_LAK = 300;   % set point setting as 0pu



% LAKVIJAYA END ========================================================

%% 2. Samanalawewa
SAM_Unit_S_nom = 60e6;   % 60 MVA per unit
SAM_H = 3.5;             % Hydro rotor inertia
SAM_R_P = 0.05;          % 5% Permanent Droop

% Hydro Turbine Dynamics (Applies to both units)
SAM_T_R = 5.0;         
SAM_R_T = 0.38;        
SAM_T_W = 1.5;

Pref_set_samanala =60; %set point setting intialize as 0

% Samanalawewa End =====================================================

%% 3. Kelanitissa Specific Parameters (Gas & CCGT)
KEL_R = 0.04;          % 4% Droop (Applies to all units)
KEL_T_CH = 0.3;        % Combustor Delay for Gas Turbines (s)
KEL_UNIT1_S_nom = 20e6;
KEL_UNIT2_S_nom = 115e6;
KEL_UNIT3_S_nom = 165e6;

% Combined Cycle Block (165 MW) Specific Fractions
KEL_CC_F_GT = 0.67;    % Gas Turbine Power Fraction (110 MW)
KEL_CC_F_ST = 0.33;    % Steam Turbine Power Fraction (55 MW)
KEL_CC_T_HRSG = 10.0;  % Heat Recovery Steam Generator Delay (s)

Pref_set_KEL_UNIT1 =20; %set point setting intialize as 0
Pref_set_KEL_UNIT2 =115; %set point setting intialize as 0
Pref_set_KEL_UNIT3 =165; %set point setting intialize as 0

%% 4. Kelanitissa Individual Inertia Constants (Seconds)
KEL_CC_H = 4.0;       % Combined Cycle Block (Heavy dual-rotor system)
KEL_GT7_H = 2.5;      % Fiat-Avio Open Cycle (Single rotor)
KEL_U1_H = 2.5;   % Frame 5 Open Cycle (Single rotor, applies to all 4)

% Kelanitissa End


%% 5. Uthuru Janani (Chunnakam) Specific Parameters (Diesel)
UTH_R = 0.04;          % 4% Droop
UTH_T_ACT = 0.1;       % Diesel Engine Actuator & Combustion Delay (s)
UTH_Unit_S_nom = 8e6;  % 8 MVA per unit (3 units total)
UTH_H = 1.5;           % 1.5s Inertia (Low mass, fast spin)

Pref_Set_UTH = 8;    %set point setting intialize as 0
% Uthuru Janani End

%% 6. Randenigala Specific Parameters (Francis Hydro)
RAN_R_P = 0.05;          % 5% Permanent Droop
RAN_R_T = 0.38;          % Transient Droop Compensation
RAN_T_R = 5.0;           % Transient Droop Time Constant (s)
RAN_T_W = 1.2;           % Water Column / Penstock Delay (s)

RAN_Unit_S_nom = 63e6;   % 63 MVA per unit (2 units total)
RAN_H = 3.5;             % 3.5s Inertia (Standard for heavy hydro rotors)

Pref_Set_RAN = 63;  %set point setting intialize as 0



%% 7. Rantambe Specific Parameters (Francis Hydro)
RTB_R_P = 0.05;          % 5% Permanent Droop
RTB_R_T = 0.38;          % Transient Droop Compensation
RTB_T_R = 5.0;           % Transient Droop Time Constant (s)
RTB_T_W = 1.0;           % Water Column / Penstock Delay (s)

RTB_Unit_S_nom = 26e6;   % 26 MVA per unit (2 units total)
RTB_H = 3.0;             % 3.0s Inertia

Pref_Set_RTB = 26;  %set point setting intialize as 0


%% 8. Bowatenna Specific Parameters (Francis Hydro)
BWT_R_P = 0.05;          % 5% Permanent Droop
BWT_R_T = 0.38;          % Transient Droop Compensation
BWT_T_R = 5.0;           % Transient Droop Time Constant (s)
BWT_T_W = 1.5;           % Water Column / Penstock Delay (s)

BWT_Unit_S_nom = 40e6;   % 40 MVA (Only 1 unit!)
BWT_H = 3.0;             % 3.0s Inertia

Pref_Set_BWT = 40;  %set point setting intialize as 0

%% 9. Ukuwela Specific Parameters (Francis Hydro)
UKU_R_P = 0.05;          % 5% Permanent Droop
UKU_R_T = 0.38;          % Transient Droop Compensation
UKU_T_R = 5.0;           % Transient Droop Time Constant (s)
UKU_T_W = 1.2;           % Water Column / Penstock Delay (s)

UKU_Unit_S_nom = 20e6;   % 20 MVA per unit (2 units total)
UKU_H = 3.0;             % 3.0s Inertia (Standard for this size)

Pref_Set_UKU = 20;  %set point setting intialize as 0


%% 10. Mannar (Thambapavani) Wind Farm Parameters
MAN_Unit_S_nom = 100e6;  % 100 MVA Wind Park
MAN_H = 0.0;             % ZERO physical inertia (Decoupled by inverters)

MAN_K_vir = 12.0;        % Synthetic/Virtual Inertia Gain (Derivative Control)
MAN_T_INV = 0.05;        % Inverter processing delay (Lightning fast 50ms)
MAN_T_FILT = 0.02;       % NEW: 20ms PLL Frequency Measurement Filter

%% 11. Maduru Oya Solar PV Farm (Inverter-Based Resource)
MAD_Unit_S_nom = 100e6;  % 100 MVA Solar Park
MAD_H = 0.0;             % ZERO physical inertia (Decoupled by inverters)

% Active Power Control (Primary Frequency Response)
MAD_R = 0.05;            % 5% Droop (Assuming curtailed operation for grid support)

% Inverter & Measurement Dynamics (Lightning Fast)
MAD_T_INV = 0.02;        % Inverter processing delay (Extremely fast 20ms)
MAD_T_FILT = 0.02;       % PLL Frequency Measurement Filter (20ms)

%% 12. LAUGFS Hambantota Solar Power Plant (IBR)
LAU_Unit_S_nom = 20e6;   % 20 MVA Solar Park
LAU_H = 0.0;             % ZERO physical inertia 

% Active Power Control (Primary Frequency Response)
LAU_R = 0.05;            % 5% Droop

% Inverter & Measurement Dynamics 
LAU_T_INV = 0.02;        % Inverter processing delay (20ms)
LAU_T_FILT = 0.02;       % PLL Frequency Measurement Filter (20ms)

%% 13. Solar One Ceylon Solar Farm (IBR)
SOC_Unit_S_nom = 12.6e6; % 12.6 MVA Solar Park
SOC_H = 0.0;             % ZERO physical inertia 

% Active Power Control (Primary Frequency Response)
SOC_R = 0.05;            % 5% Droop

% Inverter & Measurement Dynamics 
SOC_T_INV = 0.02;        % Inverter processing delay (20ms)
SOC_T_FILT = 0.02;       % PLL Frequency Measurement Filter (20ms)





%% Dinitha

%% Sobadhanavi Power Plant (GT)
% 1. Power and Grid Integration
SOBA_GT_S_nom = 220e6;   % Nominal Capacity (Approx 220 MVA)
SOBA_GT_H = 4.5;         % Inertia Constant (Gas turbines have lower inertia than coal)
SOBA_GT_R = 0.04;        % 4% Droop

% Turbine Dynamics
SOBA_GT_T_g = 0.05;      % Fast fuel valve actuator
SOBA_GT_T_t = 0.2;       % GT torque constant

Pref_Set_SOBA_GT = 220;  %set point setting intialize as 0

% Sobadhanavi GT End

%% Sobadhanavi Power Plant (ST)
% Steam Turbine (ST)
SOBA_ST_S_nom = 130e6;   % Nominal Capacity (Approx 130 MVA)
SOBA_ST_H = 3.5;         % ST rotor inertia
SOBA_ST_R = 0.04;        % 4% Droop

% Turbine Dynamics
SOBA_ST_T_hrsga = 10.0;  % HRSG "Boiler" lag (Very slow)
SOBA_ST_T_ch = 0.5;      % Steam chest constant

Pref_Set_SOBA_ST = 130;  %set point setting intialize as 0

% Sobadhanavi ST end


%% Yugadhanavi Power Plant (GT)
%Grid Integration
YUGA_GT_S_nom = 100e6;  % 100 MVA per GT
YUGA_GT_H = 4.5;        
YUGA_GT_R = 0.04;

% Turbine/Governer Dynamics
YUGA_GT_T_G = 0.1;  % Governer
YUGA_GT_T_t = 0.4;      % Turbine
% Yugadhanavi GT end

%% Yugadhanavi Power Plant (ST)
%Grid Integration
YUGA_ST_S_nom = 100e6;  % 100 MVA for the ST
YUGA_ST_H = 3.5;
YUGA_ST_R = 0.04;

%Turbine/Governer Dynamics
YUGA_ST_T_hrsga = 15.0;  % HRSG "Boiler" lag (Very slow)
YUGA_ST_T_ch = 0.3;      % Steam chest constant

Pref_Set_YUGA = 100;  %set point setting intialize as 0

%End Yugadhanavi


%% New Laxapana Power Station (Hydro - Pelton)
NLX_Unit_S_nom = 50e6;    % 50 MVA per unit (2 units total)
NLX_H = 3.5;              % Hydro rotor inertia (Typical)
NLX_R_P = 0.05;           % 5% Permanent Droop (CEB standard)

% Hydro Turbine Dynamics
NLX_T_G = 0.2;            % Main servo time constant
NLX_T_R = 5.0;            % Reset time (Temporary droop time constant)
NLX_R_T = 0.40;           % Temporary droop dashpot constant
NLX_T_W = 1.2;            % Water starting time (Slightly lower than Samanalawewa)

Pref_Set_NLX = 50;  %set point setting intialize as 0


%% Polpitiya Power Station (Hydro - Francis)
POL_Unit_S_nom = 45e6;    % 45 MVA per unit (2 units total)
POL_H = 3.0;              % Hydro rotor inertia 
POL_R_P = 0.05;           % 5% Permanent Droop (CEB standard)

% Hydro Turbine Dynamics
POL_T_G = 0.2;            % Main servo time constant
POL_T_R = 5.0;            % Reset time (Transient time constant)
POL_R_T = 0.40;           % Temporary droop dashpot constant
POL_T_W = 1.4;            % Water starting time (Slightly lower than Samanalawewa)

Pref_Set_POL = 45;  %set point setting intialize as 0


%% Uppudaluwa Wind Farm Parameters
UPP_Unit_S_nom = 10e6;   % 10 MVA Wind Park
UPP_H = 0.0;             % ZERO physical inertia
UPP_K_vir = 10.0;        % Synthetic Inertia Gain (Adjustable based on contract)
UPP_T_INV = 0.05;        % Inverter processing delay (50ms)
UPP_T_FILT = 0.02;       % PLL Frequency Measurement Filter (20ms)
UPP_R_P = 0.04;






%% Nayanajith

%% Canyon Power Station (Hydro - Francis)
CAN_Unit_S_nom = 30e6;    % 30 MVA per unit(2 units Total)
CAN_H = 3.0;              % Hydro Rotor inertia
CAN_R_P =0.05;            % 5% Permanent Droop (CEB standard)

% Hydro Turbine Dynamics
CAN_T_G = 0.2;            % Main servo time constant
CAN_T_R = 5.0;            % Reset time (Transient time constant)
CAN_R_T = 0.38;           % Temporary droop dashpot constant
CAN_T_W = 1.0;            % Water starting time

Pref_Set_CAN = 30;  %set point setting intialize as 0


%% Wimalasurendra Power Station (Hydro - Francis)
WIM_Unit_S_nom = 25e6;    % 25 MVA per unit(2 units Total)
WIM_H = 3.0;              % Hydro Rotor inertia
WIM_R_P =0.05;            % 5% Permanent Droop (CEB standard)

% Hydro Turbine Dynamics
WIM_T_G = 0.2;            % Main servo time constant
WIM_T_R = 5.0;            % Reset time (Transient time constant)
WIM_R_T = 0.38;           % Temporary droop dashpot constant
WIM_T_W = 1.0;            % Water starting time

Pref_Set_WIM = 25;  %set point setting intialize as 0


%% Old Laxapana Power Station (Hydro - Pelton )
OLX_Unit_S_nom_1 = 12.5e6;    % 12.5 MVA per unit(2 units Total)
OLX_Unit_S_nom_2 = 8.33e6;    % 8.33 MVA per unit(3 units Total)
OLX_H_1 = 3.0;                % Hydro Rotor inertia for unit 12.5 MVA
OLX_H_2 = 3.0;                % Hydro Rotor inertia for unit 8.33 MVA
OLX_R_P =0.05;                % 5% Permanent Droop (CEB standard)

% Hydro Turbine Dynamics
OLX_T_G = 0.2;            % Main servo time constant
OLX_T_R = 5.0;            % Reset time (Transient time constant)
OLX_R_T = 0.38;           % Temporary droop dashpot constant
OLX_T_W = 1.0;            % Water starting time

Pref_Set_OLX_1 = 12.5;  %set point setting intialize as 0
Pref_Set_OLX_2 = 8.33;  %set point setting intialize as 0



%% Broadland Power Station (Hydro - Francis)
BRO_Unit_S_nom = 17.5e6;    % 17.5 MVA per unit(2 units Total)
BRO_H = 3.0;                % Hydro Rotor inertia
BRO_R_P =0.05;              % 5% Permanent Droop (CEB standard)

% Hydro Turbine Dynamics
BRO_T_G = 0.2;            % Main servo time constant
BRO_T_R = 5.0;            % Reset time (Transient time constant)
BRO_R_T = 0.38;           % Temporary droop dashpot constant
BRO_T_W = 1.0;            % Water starting time

Pref_Set_BRO = 17.5;  %set point setting intialize as 0


%% Uma Oya Power Station (Hydro - Pelton)
UMA_Unit_S_nom = 60e6;   % 60 MVA per unit(total 2 units)
UMA_H = 3.5;             % Hydro rotor inertia
UMA_R_P = 0.05;          % 5% Permanent Droop

% Hydro Turbine Dynamics (Applies to both units)
UMA_T_R = 5.0;           % Reset time (Transient time constant)
UMA_R_T = 0.38;          % Temporary droop dashpot constant
UMA_T_W = 1.5;           % Water starting time

Pref_Set_UMA = 60;  %set point setting intialize as 0


%% Kukuleganga Runoff River power Station (Hydro - Francis)
KUK_Unit_S_nom = 40e6;   % 40 MVA per unit(total 2 units)
KUK_H = 3.0;             % Hydro rotor inertia
KUK_R_P = 0.05;          % 5% Permanent Droop

% Hydro Turbine Dynamics (Applies to both units)
KUK_T_R = 5.0;           % Reset time (Transient time constant)
KUK_R_T = 0.38;          % Temporary droop dashpot constant
KUK_T_W = 0.8;           % Water starting time

Pref_Set_KUK = 40;  %set point setting intialize as 0





%% Anuththara 

%% Victoria Power Station (Francis - Hydro)
VIC_Unit_S_nom = 70e6;    % 70 MVA per unit (3 units total)
VIC_H = 3.5;              % High inertia for large vertical Francis units
VIC_R_P = 0.05;           % 5% Permanent Droop
% Hydro Turbine Dynamics
VIC_T_R = 5.0;            % Temporary droop reset time
VIC_R_T = 0.38;           % Temporary droop constant
VIC_T_W = 1.2;            % Water starting time

Pref_Set_VIC = 70;  %set point setting intialize as 0


%% Kotmale Power Station (Francis - Hydro)
KOT_Unit_S_nom = 67e6;    % 67 MVA per unit (3 units total)
KOT_H = 3.5;              
KOT_R_P = 0.05;
% Hydro Turbine Dynamics
KOT_T_R = 5.0;
KOT_R_T = 0.38;
KOT_T_W = 1.1;            % Slightly shorter penstock delay than Victoria

Pref_Set_KOT = 67;  %set point setting intialize as 0


%% Upper Kotmale Power Station (Francis - Hydro)
UKT_Unit_S_nom = 83e6;    % 83 MVA per unit (2 units total)
UKT_H = 4.0;              % Larger units typically have higher relative inertia
UKT_R_P = 0.05;
% Hydro Turbine Dynamics
UKT_T_R = 5.0;
UKT_R_T = 0.40;
UKT_T_W = 1.4;            % High head leads to higher water inertia

Pref_Set_UKT = 83;  %set point setting intialize as 0


%% Sapugaskanda Power Station
SAP_R = 0.04;          % 4% Droop
SAP_T_ACT = 0.1;       % Fast Actuator & Combustion Delay (s)

% Station A (4 Units - 20 MVA each)
SAP_A_Unit_S_nom = 20e6; 
SAP_A_H = 2.0;         %

Pref_Set_UnitA = 20;  %set point setting intialize as 0

% Station B (8 Units - 10 MVA each)
SAP_B_Unit_S_nom = 10e6; 
SAP_B_H = 1.8;         % Slightly lower inertia for smaller units

Pref_Set_UnitB = 10;  %set point setting intialize as 0

%% Colombo Port Barge
BAR_Unit_S_nom = 15e6;   % 15 MW per unit (4 units total)
BAR_H = 2.5;             % Two-stroke engines often have higher rotational mass
BAR_R = 0.04;
BAR_T_ACT = 0.1;

Pref_Set_BAR = 15;  %set point setting intialize as 0




%% ========================================================================
% Plese leave the below section in below in order to omit the running
% conflicts and when you add the plant just update the Plant_S_nom and
% Plant_H array
% Define your plants in a specific order.
% Index Order: [Lakvijaya 1, Lakvijaya 2, Lakvijaya 3, Mahaweli, Kelanitissa]

% Index Order: [LAK1, LAK2, LAK3, SAM1, SAM2, SOBA_GT, SOBA_ST]
Plant_S_nom = [LAK_S_nom, LAK_S_nom, LAK_S_nom , SAM_Unit_S_nom , SAM_Unit_S_nom,  KEL_UNIT1_S_nom,KEL_UNIT1_S_nom,KEL_UNIT1_S_nom,KEL_UNIT1_S_nom,KEL_UNIT2_S_nom, KEL_UNIT3_S_nom ,UTH_Unit_S_nom,UTH_Unit_S_nom,UTH_Unit_S_nom,RAN_Unit_S_nom,RAN_Unit_S_nom, RTB_Unit_S_nom,RTB_Unit_S_nom,BWT_Unit_S_nom, UKU_Unit_S_nom,UKU_Unit_S_nom, MAN_Unit_S_nom, MAD_Unit_S_nom,LAU_Unit_S_nom,SOC_Unit_S_nom,SOBA_GT_S_nom, SOBA_ST_S_nom,YUGA_GT_S_nom, YUGA_GT_S_nom, YUGA_ST_S_nom, NLX_Unit_S_nom,NLX_Unit_S_nom, POL_Unit_S_nom, POL_Unit_S_nom,CAN_Unit_S_nom,UPP_Unit_S_nom, CAN_Unit_S_nom, WIM_Unit_S_nom, WIM_Unit_S_nom, OLX_Unit_S_nom_1, OLX_Unit_S_nom_1, OLX_Unit_S_nom_2, OLX_Unit_S_nom_2, OLX_Unit_S_nom_2, BRO_Unit_S_nom, BRO_Unit_S_nom, UMA_Unit_S_nom, UMA_Unit_S_nom, KUK_Unit_S_nom,KUK_Unit_S_nom, VIC_Unit_S_nom, VIC_Unit_S_nom, VIC_Unit_S_nom,KOT_Unit_S_nom, KOT_Unit_S_nom, KOT_Unit_S_nom,UKT_Unit_S_nom, UKT_Unit_S_nom,SAP_A_Unit_S_nom, SAP_A_Unit_S_nom, SAP_A_Unit_S_nom, SAP_A_Unit_S_nom,SAP_B_Unit_S_nom, SAP_B_Unit_S_nom, SAP_B_Unit_S_nom, SAP_B_Unit_S_nom,SAP_B_Unit_S_nom, SAP_B_Unit_S_nom, SAP_B_Unit_S_nom, SAP_B_Unit_S_nom,BAR_Unit_S_nom, BAR_Unit_S_nom, BAR_Unit_S_nom, BAR_Unit_S_nom ];    
Plant_H     = [LAK_H,   LAK_H,   LAK_H, SAM_H, SAM_H,KEL_U1_H,KEL_U1_H,KEL_U1_H,KEL_U1_H,KEL_U1_H,KEL_CC_H, UTH_H, UTH_H ,UTH_H,RAN_H,RAN_H , RTB_H, RTB_H, BWT_H,UKU_H,UKU_H,MAN_H, MAD_H,LAU_H,SOC_H,SOBA_GT_H, SOBA_ST_H, YUGA_GT_H, YUGA_GT_H,YUGA_ST_H, NLX_H,NLX_H, POL_H, POL_H,UPP_H,CAN_H,CAN_H, WIM_H, WIM_H, OLX_H_1, OLX_H_1, OLX_H_2, OLX_H_2, OLX_H_2, BRO_H, BRO_H, UMA_H, UMA_H, KUK_H,KUK_H, VIC_H, VIC_H, VIC_H,KOT_H, KOT_H, KOT_H,UKT_H, UKT_H,SAP_A_H, SAP_A_H, SAP_A_H, SAP_A_H,SAP_B_H, SAP_B_H, SAP_B_H, SAP_B_H,SAP_B_H, SAP_B_H, SAP_B_H, SAP_B_H,BAR_H, BAR_H, BAR_H, BAR_H]; 

% Automatic Equivalent Inertia Calculation
H_eq = sum(Plant_H .* Plant_S_nom) / S_base_sys;

% Universal Governor Settings
T_G = 0.2;             % Standard valve actuator delay (Applies to all plants)
