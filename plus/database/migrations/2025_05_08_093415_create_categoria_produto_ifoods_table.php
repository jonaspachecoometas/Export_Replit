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
        Schema::create('categoria_produto_ifoods', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->constrained('empresas');
            $table->string('ifood_id', 50);
            $table->string('nome', 100);
            $table->string('status', 20);
            $table->string('template', 20);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categoria_produto_ifoods');
    }
};
