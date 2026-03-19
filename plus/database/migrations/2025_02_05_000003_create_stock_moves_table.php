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
        Schema::create('stock_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('empresas')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('localizacaos')->cascadeOnDelete();
            $table->string('type');
            $table->string('origin_type')->nullable();
            $table->unsignedBigInteger('origin_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_moves');
    }
};
