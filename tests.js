var request = require('sync-request')
var chalk = require('chalk')
var testCount = 0
var testSuccesses = 0
var testFails = 0
/*
*/

var runAllTests = function() {
    test('GET /user when user does not exist returns 404', function() {
        var response = execute('GET', 'user/123')

        assertTrue(isStatus(response, 404), 'HTTP status should be 404 but was ' + response.statusCode)
    })

    test('POST /user creates a new user', function() {
        var response = execute('POST', 'user', {
            email: 'john@nodomain.com'
        })
        
        assertTrue(isOk(response), 'Expected POST to succeed with 200, got ' + response.statusCode)
        assertTrue(response.getBody('utf8') != null, 'Request body should contain an ID, did not find it in ' + log(response))
    })
    
    test('GET /user/{userId} returns user after creating one', function() {
        var userId = createNewUser('john@nodomain.com')
        
        var response = execute('GET', 'user/' + userId)
        
        assertTrue(isOk(response), 'User created should have been found')
        assertTrue(isJson(response), 'Response should be a JSON response')
        var jsonResponse = toJson(response)
        assertTrue(jsonResponse.email == 'john@nodomain.com', 'The returned user needs to match the original user created')
        assertTrue(jsonResponse.active, 'User needs to be created as active but got ' + log(response))
    })
    
    test('DELETE /user/{userId} deactivates a user', function() {
        var userId = createNewUser('someuser@nodomain.com')
        
        var response = execute('DELETE', 'user/' + userId)
        
        assertTrue(isOk(response), 'DELETE should succeed with a 200')
        response = execute('GET', 'user/' + userId)
        assertTrue(isOk(response), 'User should have been found even if deactivated')
        var jsonResponse = toJson(response)
        assertTrue(!jsonResponse.active, 'User should no longer be active')
    })
    
    test('POST /user/{userid}/tasks creates a task for a user', function() {
        var userId = createNewUser('mike@rowe.com')
        
        var response = execute('POST', 'user/' + userId + '/tasks', {
            description: 'Drycleaning'
        })
        
        assertTrue(isOk(response), 'Creating a task should have returned OK')
        assertTrue(body(response).length >= 1, 'The response should have a length greater than 1')
        var tasksResponse = execute('GET', 'user/' + userId + '/tasks') 
        var tasks = toJson(tasksResponse)
        assertTrue(tasks != null)
        assertTrue(tasks.length == 1, 'User should have 1 task but has ' + log(tasksResponse))
        assertTrue(tasks[0].active, 'Tasks should be created as active but was not ' + log(tasksResponse))
    })
    
    test('PUT /tasks/{taskId} updates an existing task', function() {
        var userId = createNewUser('mike@nodomain.com')
        var taskId = createTask('pick up the kids', userId)
        
        var response = execute('PUT', 'tasks/' + taskId, {
            description: 'pick up the cats'
        })

        assertTrue(isOk(response), 'Updating a task should have returned OK')
        var tasksResponse = execute('GET', 'user/' + userId + '/tasks')
        var tasks = toJson(tasksResponse)
        assertTrue(tasks.length > 0, 'Tasks should not be empty for user after updating')
        assertTrue(tasks[0].description == 'pick up the cats', 'Task should have been updated but was not ' + log(tasksResponse))
    })
    
    test('DELETE /tasks/{taskid} performs a soft-delete of the tasks', function() {
        var userId = createNewUser('mike@nodomain.com')
        var taskId = createTask('pick up the kids', userId)
        
        var response = execute('DELETE', 'tasks/' + taskId)
        
        assertTrue(isOk(response), 'Updating a task should have returned OK')
        var tasksResponse = execute('GET', 'user/' + userId + '/tasks')
        var tasks = toJson(tasksResponse)
        assertTrue(!tasks[0].active, 'Task should have been set to inactive, not deleted')
    })
    
    test('Endpoints return a Bad Request (400) status code for malformed requests', function() {
        var response = execute('POST', 'user', {
            notExistentField: 'bad value'
        })
        assertTrue(isBadRequest(response), 'Malformed POST /user should produce a bad request (400) but produced ' + response.statusCode)
    })
    
    test('Tasks for inactive users should not be able to be deleted', function() {
        var userId = createNewUser('someuser@nodomain.com')
        var taskId = createTask('pick up the kids', userId)
        
        var response = execute('DELETE', 'user/' + userId)
        
        response = execute('DELETE', 'tasks/' + taskId)
        assertTrue(isBadRequest(response), 'Should not be able to delete a task for an inactive user')
    })
    
    function body(response) {
        return response.getBody('utf8')
    }
    
    function log(response) {
        return response.getBody('utf8')
    }
    
    function isBadRequest(response) {
        return isStatus(response, 400)
    }
    
    function isOk(response) {
        return isStatus(response, 200)
    }
    
    function toJson(response) {
        return JSON.parse(response.getBody('utf8'))
    }
    
    function createNewUser(email) {
        return execute('POST', 'user', {
            email: email
        }).getBody('utf8')
    }
    
    function createTask(description, userId) {
        var userIdToUse = userId
        if (userId == null) {
            userIdToUse = createNewUser('random@email.com') 
        }        
        return execute('POST', 'user/' + userIdToUse + '/tasks', {
            description: 'Drycleaning'
        }).getBody('utf8')
    }
    
    console.log('Executed a total of ' + testCount + ' tests ' + chalk.green(testSuccesses + ' PASSED') + (testFails > 0 ? ' but ' + chalk.bold.red(testFails + ' FAILED') : ''))
    
}

var successCount = 0
var failureCount = 0
var testCount = 0

var test = function(testName, testFunction) {
    testCount++
    var message = testCount + ': ' + chalk.white(testName) + chalk.white(' : ')
    try {
        testFunction()
        message += chalk.green('PASSED')
        testSuccesses++
    } catch (failure) {
        message += chalk.bold.red('FAILED - ') + failure
        testFails++
    }
    console.log(message)
}

var isJson = function(response) {
    try {
        JSON.parse(response.getBody('utf8'))
        return true
    } catch (exception) {
        return false
    }
}

var execute = function(method, url, requestBody) {
    if (requestBody != null) {
        return request(method, 'http://localhost:8080/' + url, {
            json: requestBody
        })
    } else {
        return request(method, 'http://localhost:8080/' + url)
    }
    
}

var assertTrue = function(condition, message) {
    if (!condition) {
        throw chalk.bold.red('Expected [true] but got [false] - ' + message)
    }
}

var isStatus = function(response, status) {
    return status === response.statusCode
}

runAllTests()