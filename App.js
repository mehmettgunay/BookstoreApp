import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Switch, Image, TextInput, TouchableOpacity } from 'react-native';

const App = () => {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isDiscount, setIsDiscount] = useState(false);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const response = await fetch(
        'https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=GxCE1LbLAtItxAcJAW8DTNuAotIK35uu'
      );
      const data = await response.json();
      const booksWithPrices = data.results.books.map((book) => ({
        ...book,
        price: (Math.random() * 20 + 10).toFixed(2),
      }));
      setBooks(booksWithPrices);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  const updateQuantity = (isbn, newQuantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [isbn]: newQuantity > 0 ? newQuantity : 0,
    }));
  };

  const addToCart = (book) => {
    const quantity = quantities[book.primary_isbn13] || 1;
    const itemTotalPrice = parseFloat(book.price) * quantity;
    setCart([...cart, { ...book, quantity }]);
    setTotalPrice(totalPrice + itemTotalPrice);
  };

  const toggleDiscount = () => {
    setIsDiscount((prev) => !prev);
  };

  const calculateTotalPrice = () => {
    let finalPrice = totalPrice;
    if (isDiscount) {
      finalPrice = totalPrice * 0.9;
    }
    return finalPrice.toFixed(2);
  };

  const calculateOldTotalPrice = () => {
    return totalPrice.toFixed(2);
  };

  const clearCart = () => {
    setCart([]);
    setTotalPrice(0);
    setQuantities({});
  };

  const renderBook = ({ item }) => {
    const quantity = quantities[item.primary_isbn13] || 1;
    const discountedPrice = (item.price * 0.9).toFixed(2);

    return (
      <View style={styles.bookContainer}>
        <Image 
          source={{ uri: item.book_image }} 
          style={styles.bookImage} 
        />
        <View style={styles.bookDetails}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.author}>Yazar: {item.author}</Text>
          
          <View style={styles.priceContainer}>
            {isDiscount ? (
              <>
                <Text style={styles.oldPrice}>${item.price}</Text>
                <Text style={styles.newPrice}>${discountedPrice}</Text>
              </>
            ) : (
              <Text style={styles.price}>Fiyat: ${item.price}</Text>
            )}
          </View>

          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => updateQuantity(item.primary_isbn13, quantity - 1)} style={styles.button}>
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={String(quantity)}
              keyboardType="numeric"
              onChangeText={(text) => updateQuantity(item.primary_isbn13, parseInt(text) || 0)}
            />

            <TouchableOpacity onPress={() => updateQuantity(item.primary_isbn13, quantity + 1)} style={styles.button}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Button title="Sepete Ekle" onPress={() => addToCart(item)} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>En Çok Satan Kitaplar</Text>
      
      <FlatList
        data={books}
        keyExtractor={(item) => item.primary_isbn13}
        renderItem={renderBook}
      />
      
      <View style={styles.cartSummary}>
        {isDiscount ? (
          <>
            <Text style={styles.totalPriceText}>
              Toplam Tutar: <Text style={styles.oldPrice}>${calculateOldTotalPrice()}</Text> 
              <Text style={styles.newPrice}>${calculateTotalPrice()}</Text>
            </Text>
          </>
        ) : (
          <Text style={styles.totalPriceText}>Toplam Tutar: ${calculateTotalPrice()}</Text>
        )}
        
        <View style={styles.discountContainer}>
          <Text>İndirim Uygula</Text>
          <Switch
            onValueChange={toggleDiscount}
            value={isDiscount}
          />
        </View>

        <Button title="Sepeti Temizle" onPress={clearCart} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  bookContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flexDirection: 'row',
  },
  bookImage: {
    width: 100,
    height: 150,
    marginRight: 10,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    color: '#333',
  },
  oldPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  newPrice: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    width: 40,
    height: 40,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
  },
  input: {
    width: 50,
    height: 40,
    textAlign: 'center',
    marginHorizontal: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  cartSummary: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  totalPriceText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  discountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default App;