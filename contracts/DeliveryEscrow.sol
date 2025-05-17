// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeliveryEscrow {
    enum Status { Created, Accepted, Completed, Disputed }

    struct Delivery {
        uint256 id;
        address sender;
        address receiver;
        address rider;
        address token; // address(0) for native CELO, otherwise ERC20
        uint256 amount;
        Status status;
    }

    Delivery[] public deliveries;
    mapping(uint256 => bool) public deliveryExists;

    event DeliveryCreated(uint256 indexed id, address indexed sender, address indexed receiver, address token, uint256 amount);
    event DeliveryAccepted(uint256 indexed id, address indexed rider);
    event DeliveryCompleted(uint256 indexed id);
    event DeliveryDisputed(uint256 indexed id);

    function createDelivery(address receiver, address token, uint256 amount) external payable returns (uint256) {
        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Amount must be > 0");
        uint256 id = deliveries.length;
        if (token == address(0)) {
            // Native CELO
            require(msg.value == amount, "Send exact CELO amount");
        } else {
            // ERC20
            require(msg.value == 0, "Don't send CELO for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");
        }
        deliveries.push(Delivery({
            id: id,
            sender: msg.sender,
            receiver: receiver,
            rider: address(0),
            token: token,
            amount: amount,
            status: Status.Created
        }));
        deliveryExists[id] = true;
        emit DeliveryCreated(id, msg.sender, receiver, token, amount);
        return id;
    }

    function acceptDelivery(uint256 id) external {
        require(deliveryExists[id], "Delivery not found");
        Delivery storage d = deliveries[id];
        require(d.status == Status.Created, "Not available");
        d.rider = msg.sender;
        d.status = Status.Accepted;
        emit DeliveryAccepted(id, msg.sender);
    }

    function completeDelivery(uint256 id) external {
        require(deliveryExists[id], "Delivery not found");
        Delivery storage d = deliveries[id];
        require(d.status == Status.Accepted, "Not accepted");
        require(msg.sender == d.rider, "Only rider");
        d.status = Status.Completed;
        // Payout
        if (d.token == address(0)) {
            (bool sent, ) = d.rider.call{value: d.amount}("");
            require(sent, "CELO payout failed");
        } else {
            require(IERC20(d.token).transfer(d.rider, d.amount), "ERC20 payout failed");
        }
        emit DeliveryCompleted(id);
    }

    function disputeDelivery(uint256 id) external {
        require(deliveryExists[id], "Delivery not found");
        Delivery storage d = deliveries[id];
        require(d.status == Status.Accepted, "Not accepted");
        require(msg.sender == d.sender || msg.sender == d.rider, "Only sender or rider");
        d.status = Status.Disputed;
        emit DeliveryDisputed(id);
    }

    function getDeliveries() external view returns (Delivery[] memory) {
        return deliveries;
    }
} 