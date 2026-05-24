// AAU Colleges and Departments Structure
export const aauStructure = {
  'College of Business and Economics': [
    'Department of Accounting and Finance',
    'Department of Economics',
    'Department of Management',
    'Department of Public Administration',
    'School of Commerce'
  ],
  'College of Education and Language Studies': [
    'Department of Sport Science and Physical Education',
    'School of Education',
    'School of Language Studies',
    'School of Psychology'
  ],
  'College of Health Sciences': [
    'School of Medicine',
    'School of Nursing and Midwifery',
    'School of Pharmacy',
    'School of Public Health'
  ],
  'College of Humanities, Language Studies, Journalism & Communication': [
    'Amharic Language, Literature and Folklore',
    'Foreign Language and Literature',
    'Journalism and Communication',
    'Linguistics',
    'Oromo Language, Literature and Folklore',
    'Philology',
    'Teaching English as Foreign Language',
    'Tigrigna Language, Literature and Folklore'
  ],
  'College of Natural and Computational Sciences': [
    'Africa Center of Excellence for Water Management',
    'Biotechnology',
    'Chemistry',
    'Computational Science',
    'Computer Science',
    'Earth Sciences',
    'Environmental Science',
    'Food and Nutritional Sciences',
    'Geology',
    'Geophysics, Space Science and Astronomy (IGSSA)',
    'Information System',
    'Materials Science',
    'Mathematics',
    'Physics',
    'Sport Science',
    'Statistics'
  ],
  'College of Performing and Visual Arts': [
    'Film Production',
    'Fine Arts',
    'Multimedia',
    'Theater',
    'Music'
  ],
  'College of Social Sciences, Art and Humanities': [
    'African Studies',
    'Archaeology and Heritage Management',
    'Geography and Environmental Studies',
    'History',
    'International Relations',
    'Philosophy',
    'Social Anthropology',
    'Social Work',
    'Sociology'
  ],
  'College of Technology and Built Environment': [
    'Center for Biomedical Engineering',
    'Center for Energy Technology',
    'Center for Materials Engineering',
    'Center for Railway Engineering',
    'School of Chemical and Bio Engineering',
    'School of Civil and Environmental Engineering',
    'School of Electrical and Computer Engineering',
    'School of Mechanical and Industrial Engineering'
  ],
  'College of Veterinary Medicine and Agriculture': [
    'Animal Physiology',
    'Animal Production',
    'Tropical Veterinary Medicine',
    'Veterinary Clinical Medicine',
    'Veterinary Epidemiology',
    'Veterinary Microbiology',
    'Veterinary Obstetrics and Gynaecology',
    'Veterinary Parasitology',
    'Veterinary Pathology',
    'Veterinary Public Health'
  ],
  'Institute for Peace and Security Studies': [
    'IPSS Theses and Dissertations'
  ],
  'Institute of Educational Research': [
    'IER Theses and Dissertations'
  ],
  'School of Built Environment': [
    'Advanced Architectural Design',
    'Construction Management',
    'Environmental Planning',
    'Housing Development',
    'Urban Design',
    'Urban Planning'
  ],
  'School of Geography and Development Studies': [
    'Center for Population and Gender Studies',
    'Center for Rural, Local and Regional Development Studies',
    'Center for Sustainable Development',
    'Food Security Studies',
    'Institute of Development Research (IDR)',
    'Population Studies',
    'Rural Development Studies'
  ],
  'School of Law': [
    'Center for Federalism Studies',
    'Center for Human Rights',
    'Law'
  ]
};

// Get all colleges
export const getColleges = () => Object.keys(aauStructure);

// Get departments for a specific college
export const getDepartments = (college) => aauStructure[college] || [];

// Get all departments (flat list)
export const getAllDepartments = () => {
  const allDepts = [];
  Object.values(aauStructure).forEach(depts => {
    allDepts.push(...depts);
  });
  return allDepts;
};

// Find college by department
export const findCollegeByDepartment = (department) => {
  for (const [college, departments] of Object.entries(aauStructure)) {
    if (departments.includes(department)) {
      return college;
    }
  }
  return null;
};
