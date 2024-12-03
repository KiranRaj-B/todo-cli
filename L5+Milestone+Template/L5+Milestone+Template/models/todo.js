'use strict';
const { Model } = require('sequelize');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const overdueTodos = await this.overdue();
      overdueTodos.forEach((todo) => console.log(todo.displayableString()));
      console.log("\n");

      console.log("Due Today");
      const todayTodos = await this.dueToday();
      todayTodos.forEach((todo) => console.log(todo.displayableString()));
      console.log("\n");

      console.log("Due Later");
      const laterTodos = await this.dueLater();
      laterTodos.forEach((todo) => console.log(todo.displayableString()));
      console.log("\n");
    }

    static async overdue() {
      const today = new Date().toISOString().split('T')[0];
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: today },
          completed: false,
        },
        order: [['dueDate', 'ASC']],
      });
    }

    static async dueToday() {
      const today = new Date().toISOString().split('T')[0];
      return await Todo.findAll({
        where: {
          dueDate: today,
        },
        order: [['dueDate', 'ASC']],
      });
    }

    static async dueLater() {
      const today = new Date().toISOString().split('T')[0];
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: today },
          completed: false,
        },
        order: [['dueDate', 'ASC']],
      });
    }

    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id);
      if (todo) {
        todo.completed = true;
        await todo.save();
      } else {
        throw new Error(`Todo with ID ${id} not found.`);
      }
    }

    displayableString() {
      const checkbox = this.completed ? "[x]" : "[ ]";
      const dueDateStr =
        this.dueDate === new Date().toISOString().split('T')[0]
          ? ""
          : this.dueDate;
      return `${this.id}. ${checkbox} ${this.title} ${dueDateStr}`;
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Todo',
    }
  );
  return Todo;
};
