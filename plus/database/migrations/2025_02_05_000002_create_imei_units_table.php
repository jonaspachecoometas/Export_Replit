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
        Schema::create('imei_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('produtos')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('produto_variacaos')->nullOnDelete();
            $table->foreignId('company_id')->constrained('empresas')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('localizacaos')->cascadeOnDelete();
            $table->string('imei_or_serial')->unique();
            $table->string('status')->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imei_units');
    }
};
