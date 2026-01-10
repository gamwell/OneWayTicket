const { data: finalPrice, error } = await supabase
  .rpc('get_discounted_price', { 
    item_base_price: 100, // Le prix de l'article
    target_user_id: session.user.id 
  });

if (error) console.error("Erreur de calcul", error);
console.log("Prix certifié par le serveur :", finalPrice);