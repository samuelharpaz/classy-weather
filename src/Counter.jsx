import React from 'react';

class Counter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0
    };

    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleIncrement = this.handleIncrement.bind(this);
  }

  handleDecrement() {
    this.setState(curState => {
      return { count: curState.count - 1 };
    });
  }

  handleIncrement() {
    this.setState(curState => {
      return { count: curState.count + 1 };
    });
  }

  render() {
    const date = new Date('june 21 2027');
    date.setDate(date.getDate() + this.state.count);

    return (
      <div>
        <button onClick={this.handleDecrement}>-</button>
        <span>{this.state.count}</span>
        <button onClick={this.handleIncrement}>+</button>

        <p>{date.toDateString()}</p>
      </div>
    );
  }
}

export default Counter;
