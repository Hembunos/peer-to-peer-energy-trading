// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MyContract {
    struct Offer {
        uint256 energyAmount; // Energy in kWh
        uint256 pricePerKWh; // Price in Wei per kWh
        address seller;
    }

    struct Request {
        uint256 energyAmount; // Energy in kWh
        uint256 maxPricePerKWh; // Maximum price buyer is willing to pay per kWh
        address buyer;
    }

    Offer[] public offers;
    Request[] public requests;

    
    event OfferPlaced(address indexed seller, uint256 energyAmount, uint256 pricePerKWh);
    event RequestPlaced(address indexed buyer, uint256 energyAmount, uint256 maxPricePerKWh);
    event TradeExecuted(
        address indexed seller,
        address indexed buyer,
        uint256 energyAmount,
        uint256 totalPrice
    );

    // Seller places an energy offer
    function placeOffer(uint256 _energyAmount, uint256 _pricePerKWh) external {
        require(_energyAmount > 0, "Energy amount must be greater than zero.");
        require(_pricePerKWh > 0, "Price per kWh must be greater than zero.");

        offers.push(Offer({
            energyAmount: _energyAmount,
            pricePerKWh: _pricePerKWh,
            seller: msg.sender
        }));

        emit OfferPlaced(msg.sender, _energyAmount, _pricePerKWh);
    }
    
    function getOffers() public view returns (
    uint256[] memory energyAmounts,
    uint256[] memory pricesPerKWh,
    address[] memory sellers
    ) {
        uint256 length = offers.length;
        energyAmounts = new uint256[](length);
        pricesPerKWh = new uint256[](length);
        sellers = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            Offer memory offer = offers[i];
            energyAmounts[i] = offer.energyAmount;
            pricesPerKWh[i] = offer.pricePerKWh;
            sellers[i] = offer.seller;
        }
    }


    // Buyer places a request for energy
    event DebugInfo(string message, uint256 value1, uint256 value2);

function placeRequest(uint256 _energyAmount, uint256 _maxPricePerKWh) external payable {
    emit DebugInfo("Start function", _energyAmount, _maxPricePerKWh);
    emit DebugInfo("msg.value", msg.value, _energyAmount * _maxPricePerKWh);

    require(_energyAmount > 0, "Energy amount must be greater than zero.");
    require(_maxPricePerKWh > 0, "Maximum price per kWh must be greater than zero.");
    require(msg.value >= _energyAmount * _maxPricePerKWh, "Insufficient Ether sent for the request.");

    emit DebugInfo("Passed requires", _energyAmount, _maxPricePerKWh);

    requests.push(Request({
        energyAmount: _energyAmount,
        maxPricePerKWh: _maxPricePerKWh,
        buyer: msg.sender
    }));

    emit DebugInfo("Request added", _energyAmount, _maxPricePerKWh);

    emit RequestPlaced(msg.sender, _energyAmount, _maxPricePerKWh);
    matchOffers();
}


    // Matches buyers with sellers based on offers and requests
    function matchOffers() internal {
        for (uint256 i = 0; i < requests.length; i++) {
            Request memory currentRequest = requests[i];

            for (uint256 j = 0; j < offers.length; j++) {
                Offer memory currentOffer = offers[j];

                if (
                    currentOffer.energyAmount >= currentRequest.energyAmount &&
                    currentOffer.pricePerKWh <= currentRequest.maxPricePerKWh
                ) {
                    uint256 totalPrice = currentRequest.energyAmount * currentOffer.pricePerKWh;

                    // Transfer Ether to seller
                    payable(currentOffer.seller).transfer(totalPrice);

                    // Emit trade execution event
                    emit TradeExecuted(
                        currentOffer.seller,
                        currentRequest.buyer,
                        currentRequest.energyAmount,
                        totalPrice
                    );

                    // Adjust energy amounts
                    offers[j].energyAmount -= currentRequest.energyAmount;

                    // Remove the matched request
                    removeRequest(i);

                    // Exit inner loop as the request is fulfilled
                    break;
                }
            }
        }
    }

    // Removes a request from the list
    function removeRequest(uint256 index) internal {
        require(index < requests.length, "Invalid request index.");

        for (uint256 i = index; i < requests.length - 1; i++) {
            requests[i] = requests[i + 1];
        }

        requests.pop();
    }

    // Removes an offer from the list
    function removeOffer(uint256 index) internal {
        require(index < offers.length, "Invalid offer index.");

        for (uint256 i = index; i < offers.length - 1; i++) {
            offers[i] = offers[i + 1];
        }

        offers.pop();
    }
}
