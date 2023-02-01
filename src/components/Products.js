import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Stack
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard  from "./ProductCard";
import Cart from "./Cart"
// import Prodsample from "../sample.json";
import {generateCartItemsFrom} from './Cart';

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading,setLoading] = useState(1)
  const [productsList,setProductsList] = useState([])
  const [debounceTimeout,setDebounceTimeout] = useState(0)
  const [cartData,setCartData] = useState([])
  const [cartItems,setCartItems] = useState([]) 
  const token = localStorage.getItem("token")


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */


  const performAPICall = async (searchText) => 
  {
    try
    {
      setLoading(1)
      let url = null
      if(searchText !== undefined)
      {
        setLoading(1)
        url = `${config.endpoint}/products/search?value=${searchText}`
      }
      else
      {
        url = `${config.endpoint}/products`
      }
      
      let res = await axios.get(url)
      setProductsList(res.data)
      setLoading(0)
      return res.data;
    }
    catch(e)
    {
      setLoading(0)
      if(e.response.status === 404)
      {
        enqueueSnackbar("Nothing matches the search..", {varaint:"error"})  
        setProductsList([])
      }
      else
      { 
        enqueueSnackbar(e.response.data.message,{varaint:"error"})
      }
      
    }
    
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => 
  {
    // Perform api call and pass searchString as parameter and render productsList accordingly
    try
    {
      const list = performAPICall(text)
      return list
    }
    catch(e)
    {
      enqueueSnackbar(e.response.data.message,{varaint:"error"})
    }
    
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => 
  {
    if(debounceTimeout !== 0)
    {
      clearTimeout(debounceTimeout)
    }
    const newTime = setTimeout(() => {
      performSearch(event.target.value)
    },1000)
    
    setDebounceTimeout(newTime)
  }

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */

const fetchCart = async (token) => {
  try
  {
      if(token)
      {

          const url = `${config.endpoint}/cart`
          const res = await axios.get(url,{
            headers : {
              'Authorization' : `Bearer ${token}`
            }
          })
         setCartData(res.data)
         generateCartItemsFrom(res.data, productsList)
         return res.data
      }
  }catch(e)
  {
      if(e.response.data.status === 400)
      {
          enqueueSnackbar("Please log in to view Cart",{variant:"warning"})
      }
      else if(e.response && e.response.data.message)
      {
        enqueueSnackbar(e.response.data.message,{variant:"warning"})
      }
  }
}

// TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
/**
 * Return if a product already is present in the cart
 *
 * @param { Array.<{ productId: String, quantity: Number }> } items
 *    Array of objects with productId and quantity of products in cart
 * @param { String } productId
 *    Id of a product to be checked
 *
 * @returns { Boolean }
 *    Whether a product of given "productId" exists in the "items" array
 *
 */
const isItemInCart = (items, productId) => {
  for(let i=0;i<items.length;i++)
  {
    if(items[i].productId === productId) return true
  }
  return false
}
/**
 * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
 *
 * @param {string} token
 *    Authentication token returned on login
 * @param { Array.<{ productId: String, quantity: Number }> } items
 *    Array of objects with productId and quantity of products in cart
 * @param { Array.<Product> } products
 *    Array of objects with complete data on all available products
 * @param {string} productId
 *    ID of the product that is to be added or updated in cart
 * @param {number} qty
 *    How many of the product should be in the cart
 * @param {boolean} options
 *    If this function was triggered from the product card's "Add to Cart" button
 *
 * Example for successful response from backend:
 * HTTP 200 - Updated list of cart items
 * [
 *      {
 *          "productId": "KCRwjF7lN97HnEaY",
 *          "qty": 3
 *      },
 *      {
 *          "productId": "BW0jAAeDJmlZCF8i",
 *          "qty": 1
 *      }
 * ]
 *
 * Example for failed response from backend:
 * HTTP 404 - On invalid productId
 * {
 *      "success": false,
 *      "message": "Product doesn't exist"
 * }
 */
const addToCart = async (
  token,
  items,
  products,
  productId,
  qty,
  options = { preventDuplicate: false }
) => {
  if(!token)
  {
    enqueueSnackbar("Login to add an item to the Cart",{variant:"warning"})
    return
  }
      
  const itemInCart = isItemInCart(items,productId)
  
  if(itemInCart)
  {
    enqueueSnackbar("item already in cart. Use the cart sidebar to update quantity or remove item.",{varaint:"warning"})
    return
  }
  
  try
  {
    const url = `${config.endpoint}/cart`
    let res = await axios.post(url,{
        productId : productId,
        qty : qty
        },{
        headers: {
          'Content-Type' : 'application/json',
          'Authorization' : `Bearer ${token}`
        }}
      )

    let arr = generateCartItemsFrom(res.data,products)
    setCartItems(arr)	
  }
  catch(e)
  {
    if(e.response ){
      enqueueSnackbar("item already in cart ",{variant:"error"})
    } 
  }
}


  useEffect(() =>  {
    
    let cartItems = []
    const onLoad = async () => {
      setLoading(1) 
      const products = await performAPICall()
      const cartData = await fetchCart(token)
      setCartData(cartData)
      cartItems = generateCartItemsFrom(cartData,products)
      setCartItems(cartItems)
    }
    
    onLoad().then(() => {setLoading(0)})
  
  },[])  

  return (
    <div>
      <Header hasHiddenAuthButtons={false} children={
      <TextField
       className="search-desktop"
       fullWidth
       size="small"
       sx= {{ width : 500 }}
       InputProps={{
        endAdornment :(
          <InputAdornment position="start">
             <Search color="primary"></Search>
          </InputAdornment>
        ) 
       }}
       placeholder="Search for items/categories"
       onChange={(e) => debounceSearch(e,debounceTimeout)}
       name="search"
       />
       }
       >
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display- search bar in the header for Products page */}
              

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary"></Search>
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>
      <Grid container md={token ? 9 : 12}>
         <Grid item className="product-grid" >
           <Box className="hero">
             <p className="hero-heading" >
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
          </Grid>
          { loading ? (
              <Box className="loading">
                <CircularProgress />
                  <p> Loading Products</p>
              </Box> 
           ) :
           <> 
            <Grid container className="product-grid" spacing={2} paddingX={2} paddingY={5} >
               {
                  productsList.length > 0 ?
                  <>
                    {
                      productsList.map((product)=>{
                        return(
                          <Grid item md={3} xs={6} key={product._id}>
                          <ProductCard 
                            product={product}
                            handleAddToCart={async () => await addToCart(token,cartItems,productsList,product._id,1,{preventDuplicate:true})}
                            />
                          </Grid>
                        )
                      })
                    }
                  </>
                  : 
                  <Box className="noproducts" >
                    <p> No products found</p><SentimentDissatisfied />
                  </Box>
                }
                  
            </Grid>
            </>}
        </Grid>
        { token ? 
          <Grid item id="cart" md={3} >
            <Cart products={productsList} items={cartItems} handleQuantity={addToCart} />
          </Grid> 
        : null }

      </Grid>
                  
      <Footer />
    </div>

  );
};

export default Products;
