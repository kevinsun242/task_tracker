import React from 'react';
import ReactDOM from 'react-dom';
import { Link, BrowserRouter as Router, Route } from 'react-router-dom';
import _ from 'lodash';
import $ from 'jquery';


export default function root_init(node) {
  let tasks = window.tasks;
  ReactDOM.render(<Root tasks={tasks} />, node);
}

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_form: {email: "", password: ""},
      session: null,
      tasks: props.tasks,
    };

    //this.fetch_products();
    this.fetch_users();
  }

  fetch_tasks() {
    $.ajax("/api/v1/tasks", {
      method: "get",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: "",
      success: (resp) => {
        let state1 = _.assign({}, this.state, { tasks: resp.data });
        this.setState(state1);
      },
    });
  }

  add_task() {
    let title = $("#new-title").val();
    let description = $("#new-description").val();
    let time = $("#new-time").val();
    let completed = $("#new-completed").val();
    let text =  JSON.stringify({
        task: {
          title: title,
          desc: description,
          time: time,
          completed: completed,
        },
      });
    $.ajax("/api/v1/tasks", {
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: text,
      success: (resp) => {

      }
    });
  }

  login() {
    $.ajax("/api/v1/auth", {
      method: "post",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(this.state.login_form),
      success: (resp) => {
        let state1 = _.assign({}, this.state, { session: resp.data });
        this.setState(state1);
      }
    });
  }

  update_login_form(data) {
    let form1 = _.assign({}, this.state.login_form, data);
    let state1 = _.assign({}, this.state, { login_form: form1 });
    this.setState(state1);
  }

  fetch_users() {
    $.ajax("/api/v1/users", {
      method: "get",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: "",
      success: (resp) => {
        let state1 = _.assign({}, this.state, { users: resp.data });
        this.setState(state1);
      }
    });
  }

  add_user() {
    let email = $("#new-email").val();
    let password = $("#new-password").val();
    let text =  JSON.stringify({
        user: {
          email: email,
          password_hash: password,
        },
      });
    $.ajax("/api/v1/users", {
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: text,
      success: (resp) => {
        let state1 = _.assign({}, this.state, { session: resp.data });
        this.setState(state1);
      },
    });
  }

  render() {
    return <Router>
      <div>
        <Header session={this.state.session} root={this} />
        <Route path="/" exact={true} render={() =>
          <TaskList tasks={this.state.tasks} />
        } />
        <Route path="/users" exact={true} render={() =>
          <UserList users={this.state.users} />
        } />
        <Route path="/add_task" exact={true} render={() =>
          <AddTask />
        } />
        <Route path="/add_user" exact={true} render={() =>
          <AddUser />
        } />

      </div>
    </Router>;
  }
}

function Header(props) {
  let {root, session} = props;
  let session_info;
  if (session == null) {
    session_info = <div className="form-inline my-2">
      <input type="email" placeholder="email"
             onChange={(ev) => root.update_login_form({email: ev.target.value})} />
      <input type="password" placeholder="password"
             onChange={(ev) => root.update_login_form({password: ev.target.value})} />
      <button className="btn btn-secondary" onClick={() => root.login()}>Login</button>
    </div>;
  }
  else {
    session_info = <div className="my-2">
      <p>Logged in as {session.user_id}</p>
    </div>
  }

  return <div className="row my-2">
    <div className="col-4">
      <h1>Task Tracker</h1>
    </div>
    <div className="col-4">
      <p>
        <Link to={"/"}>Tasks</Link> |
        <Link to={"/users"}>Users</Link>
      </p>
    </div>
    <div className="col-4">
      {session_info}
    </div>
  </div>;
}

function TaskList(props) {
  let tasks = _.map(props.tasks, (t) => <Task key={t.id} task={t} />);
  return <div className="row">
    {tasks}
    <h4><Link to={"/add_task"}>Add Task</Link></h4>
  </div>;
}

function Task(props) {
  let {task} = props;
  return <div className="card col-4">
    <div className="card-body">
      <h2 className="card-title">{task.name}</h2>
      <p className="card-text">{task.description} <br/>
      time: {task.time} <br/>
      completed: {task.completed}</p>
    </div>
  </div>;
}

function AddTask(props) {
  return <div className="row">
    <p className="form">
       Title <input className="form-control" id="new-title" type="text" />
       Description<input className="form-control" id="new-description" type="text"/>
       Time<input className="form-control" id="new-time" type="number-input" min="0" step="15" />
       Completed<input className="form-control" id="new-completed" type="checkbox" />

     {/*  Assignee
     <select id="assignee">
         {props.users.map((e, key) => {
             return <option key={key} value={e.id}>{e.email}</option>;
         })}
      </select>
      */}
   <Link to="/" onClick={() => { root.add_task(); root.fetch_tasks();}}
     id="new-description" className="btn btn-primary">
         Create Task
    </Link>
     </p>
  </div>;
}

function UserList(props) {
  let rows = _.map(props.users, (uu) => <User key={uu.id} user={uu} />);
  return <div className="row">
    <div className="col-12">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>email</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
    <h4><Link to={"/add_user"}>Add User</Link></h4>
  </div>;
}

function User(props) {
  let {user} = props;
  return <tr>
    <td>{user.email}</td>
  </tr>;
}

function AddUser(props) {
  return <div className="row">
    <div className="form">
      Email <input className="form-control" id="new-email" type="email"/>
      <div>
        Password<input className="form-control" id="new-password" type="password"/>
      </div>
    <Link to="/" onClick={() => { root.add_user()}}
       id="new-description" className="btn btn-primary">
           Create User
    </Link>
   </div>
  </div>;
}