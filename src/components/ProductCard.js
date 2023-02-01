import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia alt={product.name} image={product.image} component="img" />
        <CardContent >
          <Typography>{product.name}</Typography>
          <Typography paddingY="1rem" fontWeight="700">${product.cost}</Typography>
          <Rating readOnly precision={0.5} value={product.rating} aria-label="stars" name="rating"></Rating>
        </CardContent>
        <CardActions className="card-actions">
          <Button
            className="card-button" 
            fullWidth 
            variant="contained" 
            name="addtocart"
            startIcon={<AddShoppingCartOutlined/>} 
            onClick={handleAddToCart} >
              ADD TO CART 
          </Button>
        </CardActions>
    </Card>
  );
};

export default ProductCard;
