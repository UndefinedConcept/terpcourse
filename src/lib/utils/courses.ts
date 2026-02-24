import type { Course, CourseTime } from '../../types';

type RawSection = {
	holdfile: string | number | null;
	meetings: string[];
	sec_code: string;
	waitlist: number;
	open_seats: number;
	course_code: string;
	instructors: string[];
	total_seats: number;
};

type RawCourse = {
	course_code: string;
	name: string;
	min_credits: number;
	max_credits: number | null;
	gen_eds: string[] | null;
	conditions: string[];
	description: string;
	sections: RawSection[];
};

type CourseDay = CourseTime['days'][number];

function parseDays(raw: string): CourseTime['days'] {
	if (!raw) return ['O' as CourseDay];

	const days: CourseDay[] = [];
	let i = 0;

	while (i < raw.length) {
		if (raw[i] === 'T') {
            if (raw[i + 1] === 'u') {
                days.push('Tu' as CourseDay);
                i += 2;
            } else if (raw[i + 1] === 'h') {
                days.push('Th' as CourseDay);
                i += 2;
            } else {
                console.warn(`Unexpected character after 'T' in days string: ${raw[i + 1]}`);
                i += 1;
            }
		} else if (raw[i] === 'M') {
			days.push('M' as CourseDay);
			i += 1;
		} else if (raw[i] === 'W') {
			days.push('W' as CourseDay);
			i += 1;
		} else if (raw[i] === 'F') {
			days.push('F' as CourseDay);
			i += 1;
		} else {
			console.warn(`Unexpected character in days string: ${raw[i]}`);
			i += 1;
		}
	}

	return days.length ? (days as CourseTime['days']) : (['O' as CourseDay] as CourseTime['days']);
}

function parseTimeToNumber(raw: string): number {
	// e.g. "12:30pm", "9:00am"
	const match = raw.trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
	if (!match) return -1; // Invalid format

	let hour = Number(match[1]);
	const minute = Number(match[2]);
	const meridiem = match[3].toLowerCase();

	if (meridiem === 'am') {
		if (hour === 12) hour = 0;
	} else {
		// pm
		if (hour !== 12) hour += 12;
	}

	return hour + minute / 60;
}

function parseMeeting(meeting: string): CourseTime {
	// Normal: "MWF-12:00pm-12:50pm-MMH-1400"
	// Special: "OnlineAsync"
	if (!meeting.includes('-')) {
		return {
			days: ['Other' as CourseDay],
			start_time: -1,
			end_time: -1,
			location: { building: 'ONLINE', room: '' }
		};
	}

	const [dayPart, start, end, building, ...roomParts] = meeting.split('-');
	const room = roomParts.join('-') || 'TBA';

	return {
		days: parseDays(dayPart),
		start_time: parseTimeToNumber(start),
		end_time: parseTimeToNumber(end),
		location: { building, room }
	};
}

export function formatTimeFromNumber(time: number): string {
    if (time < 0) return 'TBA';
    const hour = Math.floor(time);
    const minute = Math.round((time - hour) * 60);
    const meridiem = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')}${meridiem}`;
}

export function normalizeCourses(raw: RawCourse[]): Course[] {
	return raw.map((course) => ({
		course_code: course.course_code,
		name: course.name,
		min_credits: course.min_credits,
		max_credits: course.max_credits,
		gen_eds: course.gen_eds,
		conditions: course.conditions ?? [],
		description: course.description ?? '',
		sections: (course.sections ?? []).map((section) => ({
			holdfile: section.holdfile == null ? null : String(section.holdfile),
			meetings: (section.meetings ?? []).map(parseMeeting),
			sec_code: section.sec_code,
			waitlist: section.waitlist,
			open_seats: section.open_seats,
			course_code: section.course_code,
			instructors: section.instructors ?? [],
			total_seats: section.total_seats
		}))
	}));
}