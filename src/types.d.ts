// [
// 	{
// 		course_code: 'CMSC131',
// 		name: 'Object-Oriented Programming I',
// 		min_credits: 4,
// 		max_credits: null,
// 		gen_eds: null,
// 		conditions: ['Corequisite: MATH140. ', 'Credit only granted for: CMSC131, CMSC133 or CMSC141.'],
// 		description:
// 			'Introduction to programming and computer science. Emphasizes understanding and implementation of applications using object-oriented techniques. Develops skills such as program design and testing as well as implementation of programs using a graphical IDE. Programming done in Java.',
// 		sections: [
// 			{
// 				holdfile: null,
// 				meetings: ['MWF-12:00pm-12:50pm-MMH-1400', 'TuTh-12:30pm-1:20pm-CSI-2118'],
// 				sec_code: '0103',
// 				waitlist: 0,
// 				open_seats: 1,
// 				course_code: 'CMSC131',
// 				instructors: ['Nora Burkhauser'],
// 				total_seats: 30
// 			}
// 		]
// 	}
// ];

enum Day {
	Monday = 'M',
	Tuesday = 'Tu',
	Wednesday = 'W',
	Thursday = 'Th',
	Friday = 'F',
	Other = 'O'
}

// Holding data from API
export interface Course {
	course_code: string;
	name: string;
	min_credits: number; // credit = min_credits if not variable credit
	max_credits: number | null; // null if not variable credit
	gen_eds: string[] | null; // null if no gen eds, otherwise array of gen eds
	conditions: string[];
	description: string;
	sections: Section[];
}

// Holding data for sections of courses
// Usage: Course.sections
export interface Section {
	holdfile: string | null;
	meetings: CourseTime[];
	sec_code: string;
	waitlist: number;
	open_seats: number;
	course_code: string;
	instructors: string[];
	total_seats: number;
}

// Holding data for sections of courses (courses can have multiple CourseTime)
// Usage: Course.sections.meetings
// Note: meetings is an array of strings in the format "Mon-12:00pm-12:50pm-MMH-1400"
// We will parse this string into the CourseTime interface for easier handling
export interface CourseTime {
	days: Day[];
	start_time: number; // Calculated as hours + minutes/60, e.g. 12:30pm -> 12.5
	end_time: number; // Calculated as hours + minutes/60, e.g. 1:20pm -> 13.33
	location: {room: string, building: string}; // parsed to get room and building separately so we can link building to map
}
