// src/utils/courseMetadata.mjs

export function getFeaturedCourses() {
  return [
    {
      title: 'Circuit Theory',
      level: 'beginner',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.5,
      excerpt:
        'Understand the fundamentals of electric circuits, including Ohm’s law, Kirchhoff’s rules, and basic network theorems.',
      image: '/images/courses/circuit-theory.jpg',
    },
    {
      title: 'Digital Electronics',
      level: 'intermediate',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.2,
      excerpt:
        'Dive into logic gates, flip-flops, finite state machines and the design of combinational and sequential circuits.',
      image: '/images/courses/digital-electronics.jpg',
    },
    {
      title: 'Analog Electronics',
      level: 'intermediate',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.8,
      excerpt:
        'Explore MOSFETs, opamps, and amplifiers in the context of analog circuit design and signal conditioning.',
      image: '/images/courses/analog-electronics.jpg',
    },
    {
      title: 'RF & Microwave Electronics',
      level: 'advanced',
      instructor: 'Dr. Gianluca Cornetta',
      rating: 4.7,
      excerpt:
        'Analyze high-frequency circuit design principles, including transmission lines, S-parameters, and impedance matching.',
      image: '/images/courses/rf-microwave.jpg',
    },
  ];
}
