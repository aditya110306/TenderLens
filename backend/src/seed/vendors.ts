// Vendor seed data — ~80 vendors for ProcureGuard AI

export interface Vendor {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  directors: string[];
  category: string[];
  establishedYear: number;
  riskScore: number;
  winRate: number;
  totalContractsValue: number;
  totalContracts: number;
  flaggedCases: number;
  status: 'active' | 'suspended' | 'under_review';
}

// Shared addresses for anomaly detection
const ADDR_A = '14 Commerce Park, Industrial Estate, Sector 7';
const ADDR_B = '221B Techno Hub, Phase 2, MIDC';
const ADDR_C = '88 Greenfield Tower, Block C, SEZ Zone';

// Shared directors
const DIR_CROSS_1 = 'Rajesh Nambiar';
const DIR_CROSS_2 = 'Sunita Kapoor';
const DIR_CROSS_3 = 'Arun Mehta';

export const vendors: Vendor[] = [
  // === HIGH RISK CLUSTER (shared addresses, shared directors) ===
  {
    id: 'V001', name: 'Apex Infrastructure Pvt Ltd', registrationNumber: 'CIN-L45200MH2008PTC184523',
    address: ADDR_A, city: 'Mumbai', state: 'Maharashtra',
    directors: ['Pradeep Sharma', DIR_CROSS_1], category: ['Infrastructure', 'Construction'],
    establishedYear: 2008, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V002', name: 'BuildRight Solutions Ltd', registrationNumber: 'CIN-L45200MH2010PTC201456',
    address: ADDR_A, city: 'Mumbai', state: 'Maharashtra',
    directors: ['Kavita Rao', DIR_CROSS_1], category: ['Construction', 'Civil Works'],
    establishedYear: 2010, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V003', name: 'Metro Constructs India', registrationNumber: 'CIN-L45200DL2012PTC221789',
    address: ADDR_A, city: 'Delhi', state: 'Delhi',
    directors: ['Suresh Tiwari', DIR_CROSS_2], category: ['Infrastructure', 'Urban Development'],
    establishedYear: 2012, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V004', name: 'TechVision IT Services', registrationNumber: 'CIN-L72200KA2015PTC267890',
    address: ADDR_B, city: 'Bengaluru', state: 'Karnataka',
    directors: ['Amit Joshi', DIR_CROSS_2], category: ['IT', 'Software'],
    establishedYear: 2015, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V005', name: 'DigiSoft Solutions Pvt Ltd', registrationNumber: 'CIN-L72200KA2016PTC278923',
    address: ADDR_B, city: 'Bengaluru', state: 'Karnataka',
    directors: ['Neha Patel', DIR_CROSS_3], category: ['IT', 'Digital Services'],
    establishedYear: 2016, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V006', name: 'CloudMatrix Technologies', registrationNumber: 'CIN-L72200TN2017PTC289012',
    address: ADDR_B, city: 'Chennai', state: 'Tamil Nadu',
    directors: [DIR_CROSS_3, 'Vivek Menon'], category: ['IT', 'Cloud Services'],
    establishedYear: 2017, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V007', name: 'GreenBuild Engineering', registrationNumber: 'CIN-L45200GJ2011PTC212345',
    address: ADDR_C, city: 'Ahmedabad', state: 'Gujarat',
    directors: ['Dhruv Shah', DIR_CROSS_1], category: ['Construction', 'Environment'],
    establishedYear: 2011, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V008', name: 'EcoStructures Ltd', registrationNumber: 'CIN-L45200GJ2013PTC231456',
    address: ADDR_C, city: 'Ahmedabad', state: 'Gujarat',
    directors: ['Pooja Desai', DIR_CROSS_2], category: ['Environment', 'Infrastructure'],
    establishedYear: 2013, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },

  // === NORMAL VENDORS (clean) ===
  {
    id: 'V009', name: 'Horizon Healthcare Supplies', registrationNumber: 'CIN-L85110MH2005PTC152345',
    address: '33 Medical Complex, Andheri East', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Dr. Ravi Krishnan', 'Meena Iyer'], category: ['Health', 'Medical Supplies'],
    establishedYear: 2005, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V010', name: 'MedEquip India Pvt Ltd', registrationNumber: 'CIN-L85110DL2007PTC173456',
    address: '56 Healthcare Park, Okhla Phase 3', city: 'Delhi', state: 'Delhi',
    directors: ['Sanjay Gupta', 'Anita Sharma'], category: ['Health', 'Equipment'],
    establishedYear: 2007, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V011', name: 'PharmaStar Distributors', registrationNumber: 'CIN-L24230MH2009PTC192345',
    address: '12 Drug House, Lower Parel', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Ramesh Parekh', 'Lata Joshi'], category: ['Health', 'Pharmaceuticals'],
    establishedYear: 2009, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V012', name: 'EduTech Systems India', registrationNumber: 'CIN-L80300KA2014PTC245678',
    address: '78 Knowledge Park, Whitefield', city: 'Bengaluru', state: 'Karnataka',
    directors: ['Prof. Ashok Kumar', 'Divya Rao'], category: ['Education', 'IT'],
    establishedYear: 2014, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V013', name: 'LearnerFirst Pvt Ltd', registrationNumber: 'CIN-L80300MH2016PTC278901',
    address: '22 Education Hub, Bandra', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Rekha Nair', 'Siddharth More'], category: ['Education', 'Training'],
    establishedYear: 2016, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V014', name: 'TransRoute Logistics', registrationNumber: 'CIN-L63090MH2006PTC163456',
    address: '99 Freight Nagar, Turbhe', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Manoj Sawant', 'Priya Kulkarni'], category: ['Transport', 'Logistics'],
    establishedYear: 2006, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V015', name: 'FleetMaster India', registrationNumber: 'CIN-L63090TN2010PTC201789',
    address: '45 Auto Hub, Ambattur', city: 'Chennai', state: 'Tamil Nadu',
    directors: ['Balaji Sundaram', 'Kamala Devi'], category: ['Transport', 'Fleet Management'],
    establishedYear: 2010, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V016', name: 'PowerGrid Solutions Ltd', registrationNumber: 'CIN-L40100GJ2004PTC142345',
    address: '11 Energy Park, Gandhinagar', city: 'Gandhinagar', state: 'Gujarat',
    directors: ['Narendra Patel', 'Usha Mehta'], category: ['Infrastructure', 'Energy'],
    establishedYear: 2004, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V017', name: 'AquaTech Water Systems', registrationNumber: 'CIN-L36000MH2008PTC182345',
    address: '67 Water Treatment Zone, Pune', city: 'Pune', state: 'Maharashtra',
    directors: ['Girish Joshi', 'Madhuri Patil'], category: ['Environment', 'Infrastructure'],
    establishedYear: 2008, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V018', name: 'SecureNet Defense Tech', registrationNumber: 'CIN-L74999DL2003PTC122345',
    address: '1 Defense Colony, New Delhi', city: 'Delhi', state: 'Delhi',
    directors: ['Col. (Retd) Anil Verma', 'Shobha Singh'], category: ['Defence', 'Security'],
    establishedYear: 2003, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V019', name: 'SocialFirst NGO Services', registrationNumber: 'CIN-L99999MH2012PTC221234',
    address: '44 NGO Hub, Dharavi', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Anjali Bhatt', 'Rajan Tata'], category: ['Social Services', 'Community'],
    establishedYear: 2012, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V020', name: 'RoadPave Infrastructure', registrationNumber: 'CIN-L45200RJ2007PTC173234',
    address: '77 Highway Complex, Jaipur', city: 'Jaipur', state: 'Rajasthan',
    directors: ['Mohan Lal', 'Seema Choudhary'], category: ['Infrastructure', 'Transport'],
    establishedYear: 2007, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V021', name: 'DataSphere Analytics', registrationNumber: 'CIN-L72200TN2018PTC301234',
    address: '30 IT Park, Tidel Park, Chennai', city: 'Chennai', state: 'Tamil Nadu',
    directors: ['Karthik Subramaniam', 'Deepa Natarajan'], category: ['IT', 'Analytics'],
    establishedYear: 2018, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V022', name: 'HealthCare Infrastructure', registrationNumber: 'CIN-L45200AP2006PTC162345',
    address: '25 Medical Township, Hyderabad', city: 'Hyderabad', state: 'Telangana',
    directors: ['Dr. Sudha Rao', 'Kishan Reddy'], category: ['Health', 'Construction'],
    establishedYear: 2006, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V023', name: 'GovTech Platform Services', registrationNumber: 'CIN-L72200DL2019PTC312345',
    address: '5 Cyber City, Gurugram', city: 'Gurugram', state: 'Haryana',
    directors: ['Alok Singh', 'Nisha Bajwa'], category: ['IT', 'e-Governance'],
    establishedYear: 2019, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V024', name: 'UrbanPlan Associates', registrationNumber: 'CIN-L74999MH2010PTC201345',
    address: '88 Planning Hub, BKC', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Architect Vijay Rao', 'Sunanda Iyer'], category: ['Urban Development', 'Infrastructure'],
    establishedYear: 2010, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V025', name: 'SafeRoad Systems', registrationNumber: 'CIN-L45200PB2009PTC191234',
    address: '55 Traffic Solutions Park, Chandigarh', city: 'Chandigarh', state: 'Punjab',
    directors: ['Gurpreet Singh', 'Harpreet Kaur'], category: ['Transport', 'Safety'],
    establishedYear: 2009, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V026', name: 'CleanEnergy Pvt Ltd', registrationNumber: 'CIN-L40100MH2015PTC267890',
    address: '18 Solar Park, Nashik', city: 'Nashik', state: 'Maharashtra',
    directors: ['Rahul Deshpande', 'Sushma Wagh'], category: ['Energy', 'Environment'],
    establishedYear: 2015, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V027', name: 'BridgeMakers Co.', registrationNumber: 'CIN-L45200WB2005PTC152678',
    address: '42 Engineering College Road, Kolkata', city: 'Kolkata', state: 'West Bengal',
    directors: ['Subhash Bose', 'Ananya Chatterjee'], category: ['Infrastructure', 'Construction'],
    establishedYear: 2005, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V028', name: 'DigiHealth Solutions', registrationNumber: 'CIN-L85110KA2020PTC323456',
    address: '90 BioTech Park, Mysuru', city: 'Mysuru', state: 'Karnataka',
    directors: ['Dr. Anand Kumar', 'Poornima Rao'], category: ['Health', 'IT'],
    establishedYear: 2020, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V029', name: 'ForestGuard Systems', registrationNumber: 'CIN-L74999MP2011PTC212789',
    address: '7 Jungle Road, Bhopal', city: 'Bhopal', state: 'Madhya Pradesh',
    directors: ['Aditya Sinha', 'Kamla Dubey'], category: ['Environment', 'Natural Resources'],
    establishedYear: 2011, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V030', name: 'TrainTrack Engineering', registrationNumber: 'CIN-L45200OR2006PTC162890',
    address: '33 Rail Bhavan Complex, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha',
    directors: ['Jagdish Mohanty', 'Smita Nanda'], category: ['Transport', 'Infrastructure'],
    establishedYear: 2006, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V031', name: 'SmartCity Tech Ltd', registrationNumber: 'CIN-L72200HR2017PTC289345',
    address: '15 Smart Zone, Gurugram', city: 'Gurugram', state: 'Haryana',
    directors: ['Rajiv Khanna', 'Preeti Malhotra'], category: ['IT', 'Urban Development'],
    establishedYear: 2017, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V032', name: 'Wellspring Water Co', registrationNumber: 'CIN-L36000RJ2010PTC201567',
    address: '64 Water Resource Park, Jodhpur', city: 'Jodhpur', state: 'Rajasthan',
    directors: ['Mahesh Agarwal', 'Pushpa Sharma'], category: ['Environment', 'Infrastructure'],
    establishedYear: 2010, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V033', name: 'NeuroCare Medical', registrationNumber: 'CIN-L85110AP2013PTC234567',
    address: '28 Apollo Medical Zone, Hyderabad', city: 'Hyderabad', state: 'Telangana',
    directors: ['Dr. Venkat Rao', 'Lakshmi Pillai'], category: ['Health', 'Medical Equipment'],
    establishedYear: 2013, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V034', name: 'AeroSpace Defense Ltd', registrationNumber: 'CIN-L74999DL2001PTC102345',
    address: '3 Defense Research Park, Delhi', city: 'Delhi', state: 'Delhi',
    directors: ['Wing Cdr. (Retd) Surinder Negi', 'Maya Srivastava'], category: ['Defence', 'Aerospace'],
    establishedYear: 2001, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V035', name: 'SocialLink Foundation', registrationNumber: 'CIN-L99999TN2014PTC245891',
    address: '9 NGO Street, Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu',
    directors: ['Sister Mary Jose', 'Philip Thomas'], category: ['Social Services', 'Education'],
    establishedYear: 2014, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V036', name: 'TerraForm Developers', registrationNumber: 'CIN-L45200MH2003PTC122678',
    address: '71 Construction Zone, Thane', city: 'Thane', state: 'Maharashtra',
    directors: ['Suhas Bhosale', 'Vijaya Kale'], category: ['Construction', 'Real Estate'],
    establishedYear: 2003, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V037', name: 'ByteWave Technologies', registrationNumber: 'CIN-L72200KA2019PTC312678',
    address: '44 Electronic City, Phase 1', city: 'Bengaluru', state: 'Karnataka',
    directors: ['Sriram Venkataraman', 'Gayathri Murthy'], category: ['IT', 'Software Development'],
    establishedYear: 2019, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V038', name: 'CivicPride Solutions', registrationNumber: 'CIN-L99999MH2016PTC278345',
    address: '16 Civic Centre, Nagpur', city: 'Nagpur', state: 'Maharashtra',
    directors: ['Vasant Thakre', 'Nandita Mohod'], category: ['Social Services', 'Urban Development'],
    establishedYear: 2016, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V039', name: 'RenewPower Ltd', registrationNumber: 'CIN-L40100GJ2012PTC223456',
    address: '82 Wind Farm Road, Rajkot', city: 'Rajkot', state: 'Gujarat',
    directors: ['Harish Patel', 'Bharati Joshi'], category: ['Energy', 'Environment'],
    establishedYear: 2012, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V040', name: 'MobilityFirst Transport', registrationNumber: 'CIN-L63090MH2009PTC192678',
    address: '50 Bus Depot Road, Pune', city: 'Pune', state: 'Maharashtra',
    directors: ['Ashok Shinde', 'Sharda Pawar'], category: ['Transport', 'Urban Mobility'],
    establishedYear: 2009, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V041', name: 'NexGen Construction', registrationNumber: 'CIN-L45200UP2011PTC212567',
    address: '38 Builder Colony, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh',
    directors: ['Ram Asrey Mishra', 'Shanti Devi'], category: ['Construction', 'Infrastructure'],
    establishedYear: 2011, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V042', name: 'SkyLink Communications', registrationNumber: 'CIN-L64200DL2014PTC245456',
    address: '19 Telecom Park, Noida', city: 'Noida', state: 'Uttar Pradesh',
    directors: ['Deepak Chandra', 'Sonal Gupta'], category: ['IT', 'Telecommunications'],
    establishedYear: 2014, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V043', name: 'GreenLeaf Agriculture', registrationNumber: 'CIN-L01110MH2008PTC184678',
    address: '60 Agri Park, Nashik', city: 'Nashik', state: 'Maharashtra',
    directors: ['Babasaheb Patil', 'Sushma Deshpande'], category: ['Social Services', 'Agriculture'],
    establishedYear: 2008, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V044', name: 'SecureVault Defense', registrationNumber: 'CIN-L74999MH2005PTC152234',
    address: '2 Security Complex, Pune Cantonment', city: 'Pune', state: 'Maharashtra',
    directors: ['Maj. (Retd) Kishore Patil', 'Archana More'], category: ['Defence', 'Security Systems'],
    establishedYear: 2005, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V045', name: 'WasteWise Environment', registrationNumber: 'CIN-L90001KA2013PTC234890',
    address: '25 Recycling Industrial Area, Bengaluru', city: 'Bengaluru', state: 'Karnataka',
    directors: ['Prakash Urs', 'Nandini Gowda'], category: ['Environment', 'Waste Management'],
    establishedYear: 2013, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V046', name: 'EduFirst Publishers', registrationNumber: 'CIN-L80300MH2010PTC201234',
    address: '35 Publication Lane, Dadar', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Asha Godambe', 'Vinayak Sathe'], category: ['Education', 'Publishing'],
    establishedYear: 2010, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V047', name: 'FiberNet ISP Solutions', registrationNumber: 'CIN-L64200TN2016PTC278456',
    address: '27 IT Corridor, Taramani', city: 'Chennai', state: 'Tamil Nadu',
    directors: ['Suresh Kumar', 'Vijaya Lakshmi'], category: ['IT', 'Internet Services'],
    establishedYear: 2016, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V048', name: 'HealthFirst Pharma', registrationNumber: 'CIN-L24230GJ2009PTC192567',
    address: '47 Pharma City, Vadodara', city: 'Vadodara', state: 'Gujarat',
    directors: ['Rajesh Amin', 'Puja Trivedi'], category: ['Health', 'Pharmaceuticals'],
    establishedYear: 2009, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V049', name: 'PortManage Logistics', registrationNumber: 'CIN-L63090GJ2004PTC143456',
    address: '1 Port Area, Kandla', city: 'Kandla', state: 'Gujarat',
    directors: ['Haresh Kapadia', 'Neelam Solanki'], category: ['Transport', 'Port Management'],
    establishedYear: 2004, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V050', name: 'KnowledgeMap Education', registrationNumber: 'CIN-L80300DL2018PTC301567',
    address: '53 University Road, Delhi', city: 'Delhi', state: 'Delhi',
    directors: ['Prof. Arjun Kapoor', 'Dr. Seema Bose'], category: ['Education', 'Research'],
    establishedYear: 2018, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V051', name: 'CityGrid Electric', registrationNumber: 'CIN-L40100MH2007PTC173678',
    address: '76 Power Station Road, Kalyan', city: 'Kalyan', state: 'Maharashtra',
    directors: ['Dilip Kale', 'Sanjana More'], category: ['Energy', 'Infrastructure'],
    establishedYear: 2007, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V052', name: 'SanitationPro Services', registrationNumber: 'CIN-L90001UP2012PTC223789',
    address: '14 Municipal Zone, Agra', city: 'Agra', state: 'Uttar Pradesh',
    directors: ['Mukesh Yadav', 'Sunita Devi'], category: ['Social Services', 'Sanitation'],
    establishedYear: 2012, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V053', name: 'AeroLink Aviation', registrationNumber: 'CIN-L62100DL2008PTC183456',
    address: '8 Aviation Complex, Palam', city: 'Delhi', state: 'Delhi',
    directors: ['Capt. Vikram Bhatia', 'Anupama Khanna'], category: ['Transport', 'Aviation'],
    establishedYear: 2008, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V054', name: 'TechShield Cybersecurity', registrationNumber: 'CIN-L72200DL2020PTC323789',
    address: '22 Cyber Hub, Dwarka', city: 'Delhi', state: 'Delhi',
    directors: ['Arvind Kapoor', 'Ritu Sharma'], category: ['IT', 'Cybersecurity'],
    establishedYear: 2020, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V055', name: 'SolarShine Energy', registrationNumber: 'CIN-L40100RJ2013PTC234234',
    address: '4 Solar Hub, Bikaner', city: 'Bikaner', state: 'Rajasthan',
    directors: ['Ramkishan Sharma', 'Geeta Devi'], category: ['Energy', 'Renewables'],
    establishedYear: 2013, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V056', name: 'QualityBuild Contracts', registrationNumber: 'CIN-L45200GJ2015PTC267234',
    address: '36 Builder Zone, Surat', city: 'Surat', state: 'Gujarat',
    directors: ['Chandrakant Patel', 'Rekha Shah'], category: ['Construction', 'Civil Works'],
    establishedYear: 2015, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V057', name: 'IntelliMap Analytics', registrationNumber: 'CIN-L72200MH2021PTC334567',
    address: '58 Data Science Hub, Powai', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Nikhil Gokhale', 'Priya Deshmukh'], category: ['IT', 'Data Analytics'],
    establishedYear: 2021, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V058', name: 'VitalCare Medical Equipment', registrationNumber: 'CIN-L85110MH2011PTC212890',
    address: '43 MedCity Complex, Vashi', city: 'Navi Mumbai', state: 'Maharashtra',
    directors: ['Dr. Rahul Tendulkar', 'Meghna Sawant'], category: ['Health', 'Medical Equipment'],
    establishedYear: 2011, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V059', name: 'RuralLink Development', registrationNumber: 'CIN-L99999MH2009PTC193456',
    address: '66 Village Road, Kolhapur', city: 'Kolhapur', state: 'Maharashtra',
    directors: ['Bhimrao Patil', 'Savita Jadhav'], category: ['Social Services', 'Rural Development'],
    establishedYear: 2009, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V060', name: 'SwachIndia Environmental', registrationNumber: 'CIN-L90001MP2014PTC245234',
    address: '29 Green Industrial Park, Indore', city: 'Indore', state: 'Madhya Pradesh',
    directors: ['Vinod Tiwari', 'Sarita Chouhan'], category: ['Environment', 'Sanitation'],
    establishedYear: 2014, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  // Additional vendors to reach ~80
  {
    id: 'V061', name: 'AlphaNet Systems', registrationNumber: 'CIN-L72200PB2015PTC267890',
    address: '17 Tech Hub, Mohali', city: 'Mohali', state: 'Punjab',
    directors: ['Jaswant Singh', 'Harleen Kaur'], category: ['IT', 'Networking'],
    establishedYear: 2015, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V062', name: 'DeltaRoad Engineers', registrationNumber: 'CIN-L45200TN2008PTC184234',
    address: '41 Road Corporation Park, Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu',
    directors: ['Murugan Arumugam', 'Kavitha Devi'], category: ['Transport', 'Road Construction'],
    establishedYear: 2008, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V063', name: 'SafeWater Technologies', registrationNumber: 'CIN-L36000UP2010PTC201890',
    address: '73 Water Board Complex, Varanasi', city: 'Varanasi', state: 'Uttar Pradesh',
    directors: ['Shiv Narayan', 'Pushpa Gupta'], category: ['Environment', 'Water Treatment'],
    establishedYear: 2010, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V064', name: 'MedTech Devices India', registrationNumber: 'CIN-L85110TN2016PTC278234',
    address: '84 MedDevice Park, Chennai', city: 'Chennai', state: 'Tamil Nadu',
    directors: ['Dr. Arjun Rajan', 'Geeta Mani'], category: ['Health', 'Medical Devices'],
    establishedYear: 2016, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V065', name: 'NexDefense Systems', registrationNumber: 'CIN-L74999UP2007PTC173789',
    address: '6 Ordnance Complex, Kanpur', city: 'Kanpur', state: 'Uttar Pradesh',
    directors: ['Brig. (Retd) Mahesh Misra', 'Geeta Bajpai'], category: ['Defence', 'Electronics'],
    establishedYear: 2007, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V066', name: 'CargoFleet Transport', registrationNumber: 'CIN-L63090GJ2012PTC223234',
    address: '92 Freight Hub, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat',
    directors: ['Dinesh Parmar', 'Hetal Vyas'], category: ['Transport', 'Cargo'],
    establishedYear: 2012, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V067', name: 'SocialPlus Services', registrationNumber: 'CIN-L99999WB2011PTC212234',
    address: '37 NGO Hub, Howrah', city: 'Howrah', state: 'West Bengal',
    directors: ['Tapas Ghosh', 'Sandhya Roy'], category: ['Social Services', 'Community'],
    establishedYear: 2011, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V068', name: 'EduQuest Foundation', registrationNumber: 'CIN-L80300KA2017PTC289678',
    address: '11 Education City, Hubli', city: 'Hubli', state: 'Karnataka',
    directors: ['Shashidhar Murthy', 'Vidya Patil'], category: ['Education', 'Social Services'],
    establishedYear: 2017, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V069', name: 'BioMed Research India', registrationNumber: 'CIN-L85110DL2015PTC267234',
    address: '26 Research Park, Sarita Vihar', city: 'Delhi', state: 'Delhi',
    directors: ['Dr. Neeraj Suri', 'Dr. Alka Singh'], category: ['Health', 'Research'],
    establishedYear: 2015, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V070', name: 'QuickBuild Contractors', registrationNumber: 'CIN-L45200MH2019PTC312234',
    address: '69 Contractor Hub, Bhiwandi', city: 'Bhiwandi', state: 'Maharashtra',
    directors: ['Raju Patil', 'Sonu Shinde'], category: ['Construction', 'Civil Works'],
    establishedYear: 2019, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V071', name: 'GridTech Power', registrationNumber: 'CIN-L40100AP2010PTC201678',
    address: '53 Power Grid Complex, Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh',
    directors: ['Srinivasa Rao', 'Padma Devi'], category: ['Energy', 'Infrastructure'],
    establishedYear: 2010, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V072', name: 'MetroLink Urban', registrationNumber: 'CIN-L45200DL2009PTC192345',
    address: '48 Metro Complex, Dwarka', city: 'Delhi', state: 'Delhi',
    directors: ['Anil Dhawan', 'Poonam Kapoor'], category: ['Transport', 'Urban Development'],
    establishedYear: 2009, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V073', name: 'DataFlow Analytics', registrationNumber: 'CIN-L72200MH2020PTC323234',
    address: '31 Analytics Park, Hinjewadi', city: 'Pune', state: 'Maharashtra',
    directors: ['Saurabh Joshi', 'Priyanka Deshpande'], category: ['IT', 'Analytics'],
    establishedYear: 2020, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V074', name: 'NatureSave Pvt Ltd', registrationNumber: 'CIN-L90001KL2013PTC234567',
    address: '20 Eco Park, Kochi', city: 'Kochi', state: 'Kerala',
    directors: ['Joseph Mathew', 'Leela Nair'], category: ['Environment', 'Conservation'],
    establishedYear: 2013, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V075', name: 'BrightPath Education', registrationNumber: 'CIN-L80300MH2012PTC223456',
    address: '85 Education Complex, Aurangabad', city: 'Aurangabad', state: 'Maharashtra',
    directors: ['Milind Chavan', 'Smita Kamble'], category: ['Education', 'Training'],
    establishedYear: 2012, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V076', name: 'HarborMaster Shipping', registrationNumber: 'CIN-L63090MH2006PTC163789',
    address: '3 Port Trust Road, Mumbai', city: 'Mumbai', state: 'Maharashtra',
    directors: ['Capt. Nishant Rao', 'Madhavi Thakur'], category: ['Transport', 'Maritime'],
    establishedYear: 2006, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V077', name: 'HealthBridge Systems', registrationNumber: 'CIN-L85110KA2011PTC212234',
    address: '57 Health City, Mangaluru', city: 'Mangaluru', state: 'Karnataka',
    directors: ['Dr. Shailesh Shetty', 'Shubha Kamath'], category: ['Health', 'Hospital Infrastructure'],
    establishedYear: 2011, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V078', name: 'TerraClean Solutions', registrationNumber: 'CIN-L90001MH2018PTC301678',
    address: '94 Green Complex, Kolhapur', city: 'Kolhapur', state: 'Maharashtra',
    directors: ['Appasaheb Mane', 'Kalpana Jadhav'], category: ['Environment', 'Waste Management'],
    establishedYear: 2018, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V079', name: 'SignalTech Defense', registrationNumber: 'CIN-L74999DL2009PTC192678',
    address: '10 Electronics Complex, Noida', city: 'Noida', state: 'Uttar Pradesh',
    directors: ['Rajendra Saxena', 'Kavita Sinha'], category: ['Defence', 'Electronics', 'IT'],
    establishedYear: 2009, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
  {
    id: 'V080', name: 'PureAir Environmental', registrationNumber: 'CIN-L90001DL2014PTC245678',
    address: '62 Environment Complex, Faridabad', city: 'Faridabad', state: 'Haryana',
    directors: ['Sunil Dhingra', 'Meena Bahl'], category: ['Environment', 'Air Quality'],
    establishedYear: 2014, riskScore: 0, winRate: 0, totalContractsValue: 0, totalContracts: 0, flaggedCases: 0, status: 'active'
  },
];

export default vendors;
