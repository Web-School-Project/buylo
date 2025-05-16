<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'image',
        'cloudinary_id'
    ];

    protected $casts = [
        'image' => 'array'
    ];

    /**
     * Get the products for the category.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the full URL for the category image.
     */
    public function getImageUrlAttribute()
    {
        return $this->image ? $this->image['url'] : null;
    }
}
