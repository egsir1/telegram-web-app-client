import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Card from "./components/card/card";
import { getData } from "./constants/db";
import Cart from "./components/cart/cart";

const courses = getData();
const telegram = window.Telegram.WebApp;
function App() {
  const [cartItems, setCartItems] = useState([]);
  console.log("🚀 ~ App ~ cartItems:", cartItems);

  useEffect(() => {
    telegram.ready();
    telegram.MainButton.hide();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      telegram.MainButton.text = "Sotib olish :)";
      telegram.MainButton.show();
    } else {
      telegram.MainButton.hide();
    }
  }, [cartItems]);

  const onAddItem = (item) => {
    const existItem = cartItems.find((c) => c.id == item.id);

    if (existItem) {
      const newData = cartItems.map((c) =>
        c.id == item.id ? { ...existItem, quantity: existItem.quantity + 1 } : c
      );
      setCartItems(newData);
    } else {
      const newData = [...cartItems, { ...item, quantity: 1 }];
      setCartItems(newData);
    }
  };

  const onRemoveItem = (item) => {
    const existItem = cartItems.find((c) => c.id == item.id);

    if (existItem.quantity === 1) {
      const newData = cartItems.filter((c) => c.id !== existItem.id);
      setCartItems(newData);
    } else {
      const newData = cartItems.map((c) =>
        c.id === existItem.id
          ? { ...existItem, quantity: existItem.quantity - 1 }
          : c
      );
      setCartItems(newData);
    }
  };
  const onCheckout = () => {
    if (cartItems.length > 0) {
      telegram.MainButton.text = "Buy";
      telegram.MainButton.show();
    } else {
      telegram.MainButton.hide();
    }
  };

  const onSendData = useCallback(() => {
    const queryID = telegram.initDataUnsafe?.query_id;

    if (queryID) {
      fetch("http://localhost:8000/web-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartItems),
      });
    } else {
      telegram.telegram.sendData(JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    telegram.onEvent("mainButtonClicked", onSendData);

    return () => telegram.offEvent("mainButtonClicked", onSendData);
  }, [onSendData]);

  return (
    <>
      <div>
        <h1>Courses</h1>
        <Cart cartItems={cartItems} onCheckout={onCheckout} />
        <div className="cards__container">
          {courses.map((course) => (
            <Card
              key={course.id}
              course={course}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
