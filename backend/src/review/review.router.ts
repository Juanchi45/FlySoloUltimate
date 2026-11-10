import { Router } from "express";
import{
    sanitizeReviewInput,
    findAllReviews,
    findOneReview,
    addReview,
    actualizaReview,
    borrarReview
} from "./review.controler.js";
import { verificarToken, soloPiloto } from "../shared/middleware/auth.middleware.js";

export const reviewRouter = Router();

reviewRouter.get('/', verificarToken, soloPiloto, findAllReviews);
reviewRouter.get('/:id', verificarToken, soloPiloto, findOneReview);
reviewRouter.post('/', verificarToken, sanitizeReviewInput, addReview);
reviewRouter.put('/:id', verificarToken, sanitizeReviewInput, actualizaReview);
reviewRouter.patch('/:id', verificarToken, sanitizeReviewInput, actualizaReview);
reviewRouter.delete('/:id', verificarToken, borrarReview);
