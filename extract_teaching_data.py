#!/usr/bin/env python3
import json
import yaml
from collections import defaultdict
from datetime import datetime

def load_json_data(filename):
    """Load teaching data from JSON file"""
    with open(filename, 'r') as f:
        return json.load(f)

def extract_unique_courses(data):
    """Extract unique courses with their terms"""
    courses = defaultdict(set)  # Use set to avoid duplicate terms
    
    for entry in data:
        # Handle both old and new JSON formats
        enrolled_as = entry.get('enrolled_as') or entry.get('enrolled as')
        role_canonical = entry.get('role_canonical')
        
        if enrolled_as == 'TA' and role_canonical == 'TA':
            # Handle new format
            course_code = entry.get('course_code')
            course_name = entry.get('course_name', '')
            course_level = entry.get('course_level', '')
            term = entry.get('term', '')
            
            # Clean course name by removing the "cannot be added to the courses menu..." text
            if 'cannot be added to the courses menu' in course_name:
                course_name = course_name.split(' cannot be added to the courses menu')[0]
            
            # Clean course title similarly
            course_title = entry.get('course_title', '')
            if 'cannot be added to the courses menu' in course_title:
                course_title = course_title.split(' cannot be added to the courses menu')[0]
            
            # Handle special case for EEL6764 with "Click to remove" text
            if course_code == 'Click' and 'EEL6764' in course_title:
                course_code = 'EEL6764'
                course_name = 'Principles of Computer Architecture'
                course_level = 'Graduate'
                term = 'Spring 25'
            
            if course_code and course_code != 'Click' and course_name:
                # Clean up course name
                clean_name = course_name.replace(' And ', ' and ').title()
                
                # Special handling for course codes with multiple levels
                if course_code == 'CIS4930':
                    # Differentiate by course title for CIS4930
                    if 'Wireless' in course_name:
                        clean_name = 'Wireless and Mobile Computing'
                    elif 'Hardware Security' in course_name and 'Hands' in course_name:
                        clean_name = 'Hands-on Hardware Security'
                    elif 'Hardware Security' in course_name:
                        clean_name = 'Practical Hardware Security'
                    elif 'IoT' in course_name:
                        clean_name = 'IoT System Design'
                elif course_code in ['CDA4213', 'CIS6930'] and ('Cmos' in course_name.lower() or 'Vlsi' in course_name.lower() or 'CMOS' in course_name):
                    # Handle CMOS-VLSI Design courses
                    clean_name = 'CMOS-VLSI Design'
                elif course_code == 'EEL6764':
                    # Handle Computer Architecture
                    clean_name = 'Principles of Computer Architecture'
                elif course_code == 'CDA4253':
                    # Handle FPGA Design
                    clean_name = 'Field Programmable Gate Array Design'
                elif 'Logic' in course_name:
                    clean_name = 'Computer Logic and Design'
                elif 'Organization' in course_name:
                    clean_name = 'Computer Organization'
                elif 'It Concepts' in course_name.lower() or 'IT Concepts' in course_name:
                    clean_name = 'IT Concepts'
                
                key = (course_code, clean_name, course_level)
                courses[key].add(term)
    
    return courses

def convert_term_to_readable(terms):
    """Convert term codes to readable format"""
    term_mapping = {
        'Fall 18': 'Fall 2018',
        'Spring 19': 'Spring 2019', 
        'Fall 19': 'Fall 2019',
        'Spring 20': 'Spring 2020',
        'Summer 20': 'Summer 2020',
        'Fall 20': 'Fall 2020',
        'Spring 21': 'Spring 2021',
        'Summer 21': 'Summer 2021',
        'Fall 21': 'Fall 2021',
        'Spring 22': 'Spring 2022',
        'Summer 22': 'Summer 2022',
        'Fall 22': 'Fall 2022',
        'Spring 23': 'Spring 2023',
        'Summer 23': 'Summer 2023',
        'Fall 23': 'Fall 2023',
        'Spring 24': 'Spring 2024',
        'Summer 24': 'Summer 2024',
        'Fall 24': 'Fall 2024',
        'Spring 25': 'Spring 2025',
        'Fall 2018': 'Fall 2018',
        'Spring 2019': 'Spring 2019', 
        'Fall 2019': 'Fall 2019',
        'Spring 2020': 'Spring 2020',
        'Summer 2020': 'Summer 2020',
        'Fall 2020': 'Fall 2020',
        'Spring 2021': 'Spring 2021',
        'Summer 2021': 'Summer 2021',
        'Fall 2021': 'Fall 2021',
        'Spring 2022': 'Spring 2022',
        'Summer 2022': 'Summer 2022',
        'Fall 2022': 'Fall 2022',
        'Spring 2023': 'Spring 2023',
        'Summer 2023': 'Summer 2023',
        'Fall 2023': 'Fall 2023',
        'Spring 2024': 'Spring 2024',
        'Summer 2024': 'Summer 2024',
        'Fall 2024': 'Fall 2024',
        'Spring 25': 'Spring 2025',
    }
    
    readable_terms = []
    for term in sorted(set(terms)):
        readable_term = term_mapping.get(term, term)
        if readable_term:
            readable_terms.append(readable_term)
    
    return ', '.join(readable_terms)

def generate_teaching_yaml(courses):
    """Generate teaching YAML structure"""
    teaching_entries = []
    
    # Sort courses by code and level
    sorted_courses = sorted(courses.items(), key=lambda x: (x[0][0], x[0][2]))
    
    for (course_code, course_name, course_level), terms in sorted_courses:
        if course_code:  # Only include courses with valid codes
            readable_duration = convert_term_to_readable(terms)
            
            # Determine course level description
            level_desc = "graduate" if course_level == "Graduate" else "undergraduate"
            
            # Create description based on course content
            if "CMOS-VLSI Design" in course_name:
                description = f"Assisted with {level_desc} CMOS-VLSI design courses"
            elif "Computer Logic and Design" in course_name:
                description = f"Assisted with {level_desc} computer logic and design courses"
            elif "Computer Organization" in course_name:
                description = f"Supported {level_desc} computer organization course"
            elif "IT Concepts" in course_name:
                description = f"Supported {level_desc} IT concepts course across multiple semesters"
            elif "Field Programmable Gate Array Design" in course_name:
                description = f"Assisted with {level_desc} FPGA design course"
            elif "Wireless and Mobile Computing" in course_name:
                description = f"Assisted with {level_desc} wireless and mobile computing course"
            elif "Hands-on Hardware Security" in course_name:
                description = f"Supported hands-on hardware security course for {level_desc} students"
            elif "Practical Hardware Security" in course_name:
                description = f"Supported practical hardware security course for {level_desc} students"
            elif "IoT System Design" in course_name:
                description = f"Assisted with IoT system design course for {level_desc} students"
            elif "Principles of Computer Architecture" in course_name:
                description = f"Currently assisting with computer architecture course for {level_desc} students"
            elif "Networks" in course_name:
                description = f"Assisted with computer networks lab course"
            else:
                description = f"Assisted with {level_desc} course"
            
            teaching_entry = {
                'role': 'Teaching Assistant',
                'course': f"{course_name} ({course_code})",
                'level': course_level,
                'organization': 'University of South Florida',
                'duration': readable_duration,
                'description': description
            }
            
            teaching_entries.append(teaching_entry)
    
    # Add research mentor entry
    teaching_entries.append({
        'role': 'Research Mentor',
        'organization': 'University of South Florida',
        'duration': '2020-2025',
        'description': 'Mentored undergraduate and graduate students in ML optimization and embedded systems research'
    })
    
    return {'teaching': teaching_entries}

def main():
    """Main function to extract and save teaching data"""
    print("Loading teaching data from JSON...")
    json_data = load_json_data('data/ta_courses_confirmed.json')
    
    print("Extracting unique courses...")
    courses = extract_unique_courses(json_data)
    
    print(f"Found {len(courses)} unique courses")
    
    print("Generating YAML structure...")
    teaching_yaml = generate_teaching_yaml(courses)
    
    print("Saving to teaching.yaml...")
    with open('data/teaching.yaml', 'w') as f:
        yaml.dump(teaching_yaml, f, default_flow_style=False, sort_keys=False, indent=2)
    
    print("✅ Teaching data successfully extracted and saved!")
    
    # Print summary
    print("\n📊 Summary:")
    for entry in teaching_yaml['teaching'][:-1]:  # Exclude research mentor
        print(f"  • {entry['course']} - {entry['duration']}")

if __name__ == "__main__":
    main()
