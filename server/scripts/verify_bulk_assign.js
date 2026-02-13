const API_URL = 'http://localhost:5000/api';

async function verifyBulkAssign() {
    try {
        // 1. Login as admin
        console.log('Logging in as admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            const text = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText} - ${text}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        // 2. Get all employees to find IDs
        console.log('Fetching employees...');
        const employeesRes = await fetch(`${API_URL}/admin/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!employeesRes.ok) {
            const text = await employeesRes.text();
            throw new Error(`Failed to fetch employees: ${employeesRes.status} ${employeesRes.statusText} - ${text}`);
        }

        const allUsers = await employeesRes.json();
        const employees = allUsers.filter(u => u.role === 'employee');

        if (employees.length < 2) {
            console.log('Not enough employees to test bulk assignment. Need at least 2.');
            console.log(`Found: ${employees.length}`);
        }

        const employeeIds = employees.map(e => e._id);
        console.log(`Found ${employeeIds.length} employees to assign task to.`);

        // 3. Assign task to multiple employees
        if (employeeIds.length > 0) {
            console.log('Assigning task...');
            const taskData = {
                title: 'Bulk Assignment Test Task',
                description: 'This is a test task assigned to multiple employees via script.',
                assignedTo: employeeIds, // Send array of IDs
                dueDate: new Date().toISOString().split('T')[0],
                role: 'Web Developer'
            };

            // CORRECT ENDPOINT HERE
            const assignRes = await fetch(`${API_URL}/admin/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });

            console.log(`Assignment Response Status: ${assignRes.status} ${assignRes.statusText}`);
            const responseText = await assignRes.text();
            // console.log('Assignment Response Body:', responseText);

            if (!assignRes.ok) {
                throw new Error(`Assignment failed with status ${assignRes.status}`);
            }

            let assignData;
            try {
                assignData = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON');
                return;
            }

            console.log('Assignment response data:', assignData);

            if (assignRes.status === 201 && assignData.tasks && assignData.tasks.length === employeeIds.length) {
                console.log('SUCCESS: Task assigned to all selected employees.');
            } else {
                console.error('FAILURE: Response did not match expected result.');
            }
        } else {
            console.log('Skipping assignment as no employees found.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyBulkAssign();
