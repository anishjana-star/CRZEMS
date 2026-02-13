const API_URL = 'http://localhost:5000/api';

async function verifyFeatures() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
        });
        if (!loginRes.ok) throw new Error('Login failed');
        const { token, user } = await loginRes.json();
        console.log('Login successful.');

        // 2. Fetch Employees
        const empRes = await fetch(`${API_URL}/admin/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const employees = await empRes.json();
        const testEmployee = employees.find(e => e.role === 'employee');

        if (!testEmployee) {
            console.log('No employee found to test salary payment.');
            return;
        }
        console.log(`Testing with employee: ${testEmployee.name} (${testEmployee._id})`);

        // 3. Pay Salary (Triggers PDF & Email)
        console.log('Paying salary...');
        const payRes = await fetch(`${API_URL}/admin/payroll/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                employeeId: testEmployee._id,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                basicSalary: testEmployee.salary || 5000,
                allowances: 0,
                deductions: 0
            })
        });

        if (payRes.status === 400) {
            const error = await payRes.json();
            console.log('Salary already paid for this month:', error.message);
        } else if (!payRes.ok) {
            console.log('Pay Salary failed:', payRes.status, await payRes.text());
        } else {
            console.log('Salary paid successfully. Check server logs for email sending.');
        }

        // 4. Test Task Assignment (Double Submit is UI, but API should work)
        console.log('Assigning task...');
        const taskRes = await fetch(`${API_URL}/admin/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Test Task for Verification',
                description: 'Checking if API works',
                assignedTo: [testEmployee._id],
                dueDate: new Date().toISOString()
            })
        });

        if (taskRes.ok) {
            console.log('Task assigned successfully.');
        } else {
            console.log('Task assignment failed:', await taskRes.text());
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verifyFeatures();
