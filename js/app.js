const api_path = "wi0821";
const token = "3EnBdzZQGnVhYpFgDb9Hapr42ia2";

//Global DOM
const productList = document.querySelector(".productWrap");
const cartList = document.querySelector(".shoppingCart-table");

const form = document.querySelector(".orderInfo-form");

const btnOrderSubmit = document.querySelector(".orderInfo-btn");

const productListHTML = objItem => `<li class="productCard" data-category="${objItem.category}" data-productid=${objItem.id}><h4 class="productType">新品</h4><img src="${objItem.images}" alt="${objItem.title}"><a href="#" class="addCardBtn">加入購物車</a><h3>${objItem.title}</h3><del class="originPrice">NT$${objItem.origin_price}</del><p class="nowPrice">NT$${objItem.price.toLocaleString("en-US")}</p></li>`;

const cartListHeader = `<tr><th width="40%">品項</th><th width="15%">單價</th><th width="15%">數量</th><th width="15%">金額</th><th width="15%"></th></tr>`;

const cartListContent = (objItem, total) => `<tr data-cartid=${objItem.id}><td><div class="cardItem-title"><img src="${objItem.product.images}" alt="${objItem.product.title}"><p>${objItem.product.title}</p></div></td><td>NT$${objItem.product.price.toLocaleString("en-US")}</td><td>${objItem.quantity}</td><td>NT$${total.toLocaleString("en-US")}</td><td class="discardBtn"><a href="#" class="material-icons">clear</a></td></tr>`;

const cartListFooter = total => `<tr><td><a href="#" class="discardAllBtn">刪除所有品項</a></td><td></td><td></td><td><p>總金額</p></td><td>NT$${total.toLocaleString("en-US")}</td></tr>`;

let cartData = [];

getProductList();
getCartList();

function renderProductList(data) {
    let str = "";
    data.forEach((item) =>{
        str +=  productListHTML(item);
    })
    productList.innerHTML = str;

    //btn DOM
    const btnCartItemAdd = document.querySelectorAll(".addCardBtn");
    addListListener(btnCartItemAdd,"addItem");
}

function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
        renderProductList(response["data"]["products"]);

    })
    .catch(function(error){
        console.log(error.response.data);
    })
}

let orderData =
{
    "name": "",
    "tel": "",
    "email": "",
    "address": "",
    "payment": "ATM"
};

form.addEventListener('change', (e) => {


    let target = e.target;

    let formValue = target.value;
    let FormName  = target.name;

    switch (FormName) {
    case '姓名':
        orderData["name"] = formValue;
        break;
    case '電話':
        orderData["tel"] = formValue;
        break;
    case 'Email':
        orderData["email"] = formValue;
        break;
    case '寄送地址':
        orderData["address"] = formValue;
        break;
    case '交易方式':
        orderData["payment"] = document.getElementById("tradeWay").value;
        break;
    }
})

btnOrderSubmit.addEventListener("click", (e) => {
    // e.preventDefault();
    if(cartData.length == 0) {
        alert("當前購物車內沒有產品，所以無法送出訂單 RRR ((((；゜Д゜)))");
    } else if (isEmpty(orderData["name"]) || isEmpty(orderData["tel"]) || isEmpty(orderData["email"]) || isEmpty(orderData["address"])) {
        alert("請填入必填資料!!!");
    } else {
        createOrder();
    }

    function isEmpty(item) {
        let trimItem = item.trim();
        if(trimItem == null || trimItem === "") {
            return true;
        }
    }
})


function addListListener(btnlist,action) {
    btnlist.forEach(button => {
        button.addEventListener("click",(e) => {
            e.preventDefault();

            if(!action) {
                return;
            } else if(action === "addItem") {
                // 找到最接近的 '.productCard' 父元素，並獲取商品卡片的 id
                const getProductID = button.closest(".productCard").dataset.productid;

                let cartQuantity = 1;

                cartData.forEach(item => {
                    if(getProductID === item["product"]["id"]) {
                        cartQuantity = item["quantity"];
                        cartQuantity++;
                    } else {
                        return;
                    }
                })
                addCartItem(getProductID,cartQuantity);
                console.log("新增成功, PrdouctID: ",getProductID);

            } else if (action === "deleteItem") {
                //取得購物車ID
                const getCartItemID = button.closest("tr").dataset.cartid;
                deleteCartItem(getCartItemID);
                console.log("刪除成功, CarttID: ",getCartItemID);
            } else if (action === "getValue") {

            }
        })
    })
}

function renderCartList(data) {
    let str = "";
    data["carts"].forEach((item) =>{
        let total = item.product.price * item.quantity;
        str +=  cartListContent(item,total);
    })

    cartList.innerHTML = cartListHeader + str + cartListFooter(data.finalTotal);

    const btnDeleteCartItem = document.querySelectorAll(".discardBtn");
    const btnDeleteAllCartItem = document.querySelector(".discardAllBtn");

    addListListener(btnDeleteCartItem,"deleteItem");

    btnDeleteAllCartItem.addEventListener("click" ,(e) => {
        e.preventDefault();
        deleteAllCartList();
    })
}

// 取得購物車列表
function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
        cartData =  response.data.carts
        renderCartList(response.data);
    })
}

// 加入購物車
function addCartItem(productId, CartNum) {
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    data: {
        "productId": productId,
        "quantity": CartNum
    }
    }).
    then(function (response) {
        getCartList();
    })

}

// 清除購物車內全部產品
function deleteAllCartList() {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
        renderCartList(response.data);
        console.log("購物車商品已全部刪除");
    })
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
    then(function (response) {
        renderCartList(response.data);
    })
}

// 送出購買訂單
function createOrder() {

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
        {
            "data": {
            "user": orderData
            }
        }
    ).
    then(function (response) {
    console.log(response.data);
    deleteAllCartList();
    })
    .catch(function(error){
        console.log(error.response.data);
    })
}


// 取得訂單列表
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
    headers: {
        'Authorization': token
    }
    })
    .then(function (response) {
        console.log(response.data);
    })
}

getOrderList();
