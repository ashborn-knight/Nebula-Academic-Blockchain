export interface ConsortiumUniversityNode {
  id: string;
  name: string;
  shortName: string;
  motto?: string;
  primaryColor?: string;
  walletAddress: string;
  nodeRegion: string;
  validatorType: string;
  defaultStudent: {
    studentName: string;
    studentId: string;
    degreeName: string;
    major: string;
    classification: string;
    gpa: string;
  };
}

export const CONSORTIUM_UNIVERSITIES: ConsortiumUniversityNode[] = [
  {
    id: 'umat',
    name: 'University of Mines and Technology (UMaT)',
    shortName: 'UMaT',
    motto: 'Knowledge, Truth and Excellence',
    primaryColor: '#008751',
    walletAddress: '0x71C93B2e10984a91283F01aC44109B91A49288A2',
    nodeRegion: 'Tarkwa Authority Node #1',
    validatorType: 'PoA Registrar Node',
    defaultStudent: {
      studentName: 'Kwame Mensah',
      studentId: 'UMaT-2022-7729',
      degreeName: 'Bachelor of Science',
      major: 'Software Engineering',
      classification: 'First Class Honors',
      gpa: '3.92'
    }
  },
  {
    id: 'knust',
    name: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    shortName: 'KNUST',
    motto: 'Nyansapo Wosane No Badwenma',
    primaryColor: '#006837',
    walletAddress: '0xF820491A80293Bc10492810938104820194844E1',
    nodeRegion: 'Kumasi Authority Node #2',
    validatorType: 'PoA Registrar Node',
    defaultStudent: {
      studentName: 'Abena Serwaa Prempeh',
      studentId: 'KNUST-910283',
      degreeName: 'Bachelor of Science',
      major: 'Computer Engineering',
      classification: 'First Class Honors',
      gpa: '3.88'
    }
  },
  {
    id: 'ug',
    name: 'University of Ghana (UG)',
    shortName: 'UG (Legon)',
    motto: 'Integri Procedamus',
    primaryColor: '#002147',
    walletAddress: '0x3A9104820194820194820194820194820194921B',
    nodeRegion: 'Legon Authority Node #3',
    validatorType: 'PoA Registrar Node',
    defaultStudent: {
      studentName: 'Kofi Addo Dankwa',
      studentId: 'UG-10928374',
      degreeName: 'Bachelor of Science',
      major: 'Computer Science',
      classification: 'First Class Honors',
      gpa: '3.95'
    }
  },
  {
    id: 'ucc',
    name: 'University of Cape Coast (UCC)',
    shortName: 'UCC',
    motto: 'Veritas Nobis Lumen',
    primaryColor: '#D0021B',
    walletAddress: '0x8C120491029482019482019482019482019433F9',
    nodeRegion: 'Cape Coast Authority Node #4',
    validatorType: 'PoA Registrar Node',
    defaultStudent: {
      studentName: 'Akosua Mensah',
      studentId: 'UCC-882910',
      degreeName: 'Bachelor of Science',
      major: 'Information Technology',
      classification: 'First Class Honors',
      gpa: '3.81'
    }
  },
  {
    id: 'ashesi',
    name: 'Ashesi University',
    shortName: 'Ashesi',
    motto: 'Scholarship • Leadership • Citizenship',
    primaryColor: '#800020',
    walletAddress: '0x5D091048201948291048201948201948201911A7',
    nodeRegion: 'Berekuso Authority Node #5',
    validatorType: 'PoA Registrar Node',
    defaultStudent: {
      studentName: 'Yaw Osei Tutu',
      studentId: 'ASH-2026-4412',
      degreeName: 'Bachelor of Science',
      major: 'Computer Engineering',
      classification: 'First Class Honors',
      gpa: '3.90'
    }
  },
  {
    id: 'uenr',
    name: 'University of Energy and Natural Resources (UENR)',
    shortName: 'UENR',
    motto: 'Knowledge for Development',
    primaryColor: '#1B4D3E',
    walletAddress: '0x2E440194820194820194820194820194820177C0',
    nodeRegion: 'Sunyani Authority Node #6',
    validatorType: 'PoA Registrar Node',
    defaultStudent: {
      studentName: 'Emmanuel Kwarteng',
      studentId: 'UENR-55201',
      degreeName: 'Bachelor of Science',
      major: 'Renewable Energy Engineering',
      classification: 'First Class Honors',
      gpa: '3.84'
    }
  }
];
