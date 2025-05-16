<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Drop the old image column
            $table->dropColumn('image');
            // Add new json column for image data
            $table->json('image')->nullable()->after('description');
            $table->string('cloudinary_id')->nullable()->after('image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('cloudinary_id');
            $table->dropColumn('image');
            $table->string('image')->nullable()->after('description');
        });
    }
}; 