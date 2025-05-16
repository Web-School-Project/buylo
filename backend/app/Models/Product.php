<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'category_id',
        'slug',
        'quantity',
        'image',
        'cloudinary_id'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'quantity' => 'integer'
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the images for the product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order');
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get the product's primary image URL.
     */
    public function getPrimaryImageUrlAttribute(): string
    {
        $primaryImage = $this->primaryImage()->first();
        return $primaryImage ? $primaryImage->url : asset('images/no-image.png');
    }
}
