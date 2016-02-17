# Spring-Tutorial Reference Tests

Create this very simple Spring application (start with just the backend as a set of REST endpoints)

To execute these tests your application needs to be running on `http://localhost:8080` with no context path.

From a business requirements perspective here’s what I would have it do first
  
1. `POST /user` creates a new “user” and returns the user’s ID
2. `GET /user/{userid}` returns the details of a user (you can choose what details you want, but I would suggest maybe email and user id)
3. `GET /user/{userid}/tasks` returns a list of tasks for the user with the given id
4. `DELETE /user/{userid}` “soft-delete” a user, basically means the user is not active
5. `POST /user/{userid}/tasks` creates a new task with the task given as part of the request body for the given user and returns the task id
6. `PUT /tasks/{taskid}` updates an existing task with the task given as part of the request body
7. `DELETE /tasks/{taskid}` performs a “soft-delete” that sets the task as inactive
8. Tasks for inactive users should not be able to be deleted and should return an appropriate HTTP error code (you can look up the 400 range error codes on Wikipedia).
9. Request bodies that are mal-formed should also return an appropriate HTTP error code (again, up to you what “appropriate” means)
