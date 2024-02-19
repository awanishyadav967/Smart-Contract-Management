// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(address indexed depositor, uint256 amount);
    event Withdraw(address indexed withdrawer, uint256 amount);
    event Transfer(address indexed sender, address indexed recipient, uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        // perform transaction
        balance += msg.value;

        // emit the event
        emit Deposit(msg.sender, msg.value);
    }

    function transfer(address _recipient, uint256 _amount) public {
        require(_amount > 0, "Transfer amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.sender != _recipient, "Sender and recipient cannot be the same");

        // ensure sufficient balance
        require(balance >= _amount, "Insufficient balance for transfer");

        // perform transaction
        balance -= _amount;

        // transfer funds to the recipient
        payable(_recipient).transfer(_amount);

        // emit the event
        emit Transfer(msg.sender, _recipient, _amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");

        // ensure sufficient balance
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // perform transaction
        balance -= _withdrawAmount;

        // emit the event
        emit Withdraw(msg.sender, _withdrawAmount);
    }
}